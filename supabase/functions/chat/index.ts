import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TOOLS = [
  {
    type: "function",
    function: {
      name: "create_task",
      description: "Create a new task on the user's Kanban board",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Task title" },
          description: { type: "string", description: "Task description" },
          status: { type: "string", enum: ["todo", "in_progress", "done"], description: "Task status column" },
          priority: { type: "string", enum: ["low", "medium", "high"], description: "Task priority" },
          due_date: { type: "string", description: "Due date in YYYY-MM-DD format" },
          tags: { type: "array", items: { type: "string" }, description: "Tags for the task" },
        },
        required: ["title"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_task",
      description: "Update an existing task. Use the task title or context to find the right task ID from the user's tasks list.",
      parameters: {
        type: "object",
        properties: {
          task_id: { type: "string", description: "The UUID of the task to update" },
          title: { type: "string" },
          description: { type: "string" },
          status: { type: "string", enum: ["todo", "in_progress", "done"] },
          priority: { type: "string", enum: ["low", "medium", "high"] },
          due_date: { type: "string" },
          tags: { type: "array", items: { type: "string" } },
        },
        required: ["task_id"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_task",
      description: "Delete a task from the user's board",
      parameters: {
        type: "object",
        properties: {
          task_id: { type: "string", description: "The UUID of the task to delete" },
        },
        required: ["task_id"],
        additionalProperties: false,
      },
    },
  },
];

async function executeToolCall(
  fnName: string,
  args: Record<string, unknown>,
  userId: string,
  supabaseUrl: string,
  serviceKey: string
): Promise<string> {
  const supabase = createClient(supabaseUrl, serviceKey);

  if (fnName === "create_task") {
    const { data, error } = await supabase
      .from("tasks")
      .insert({
        title: args.title as string,
        description: (args.description as string) || null,
        status: (args.status as string) || "todo",
        priority: (args.priority as string) || "medium",
        due_date: (args.due_date as string) || null,
        tags: (args.tags as string[]) || null,
        user_id: userId,
      })
      .select()
      .single();
    if (error) return JSON.stringify({ error: error.message });
    return JSON.stringify({ success: true, task: data });
  }

  if (fnName === "update_task") {
    const { task_id, ...updates } = args;
    // Remove undefined values
    const cleanUpdates: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(updates)) {
      if (v !== undefined && v !== null) cleanUpdates[k] = v;
    }
    const { data, error } = await supabase
      .from("tasks")
      .update(cleanUpdates)
      .eq("id", task_id as string)
      .eq("user_id", userId)
      .select()
      .single();
    if (error) return JSON.stringify({ error: error.message });
    return JSON.stringify({ success: true, task: data });
  }

  if (fnName === "delete_task") {
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", args.task_id as string)
      .eq("user_id", userId);
    if (error) return JSON.stringify({ error: error.message });
    return JSON.stringify({ success: true });
  }

  return JSON.stringify({ error: "Unknown function" });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, taskContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Extract user ID from auth token
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    const supabaseAuth = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!);
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `You are FlowBoard AI, a helpful assistant integrated into a Kanban board app. You can help users with:
1. General questions - answer anything like a knowledgeable assistant
2. Task management - you can CREATE, UPDATE, and DELETE tasks directly on the board using your tools
3. Productivity advice - time management, workflow optimization

When the user asks you to create a task, move a task, change priority, or delete a task, USE YOUR TOOLS to do it immediately.
When updating or deleting, match the task by title from the user's tasks list to find the correct task_id.

Be concise, friendly, and actionable. Use markdown formatting when helpful.
${taskContext || ""}`;

    const aiMessages = [
      { role: "system", content: systemPrompt },
      ...messages,
    ];

    // Step 1: Non-streaming call with tools to check for tool usage
    const toolCheckResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: aiMessages,
        tools: TOOLS,
        stream: false,
      }),
    });

    if (!toolCheckResponse.ok) {
      const status = toolCheckResponse.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await toolCheckResponse.text();
      console.error("AI gateway error:", status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const toolCheckData = await toolCheckResponse.json();
    const choice = toolCheckData.choices?.[0];
    const toolCalls = choice?.message?.tool_calls;

    // If no tool calls, stream the final response directly
    if (!toolCalls || toolCalls.length === 0) {
      // The response already has content, return it as SSE
      const content = choice?.message?.content || "";
      const ssePayload = `data: ${JSON.stringify({
        choices: [{ delta: { content }, finish_reason: "stop" }],
      })}\n\ndata: [DONE]\n\n`;

      return new Response(ssePayload, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    // Step 2: Execute tool calls
    const toolResults: { tool_call_id: string; role: "tool"; content: string }[] = [];
    const executedActions: string[] = [];

    for (const tc of toolCalls) {
      const args = JSON.parse(tc.function.arguments);
      const result = await executeToolCall(tc.function.name, args, user.id, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      toolResults.push({
        tool_call_id: tc.id,
        role: "tool",
        content: result,
      });
      executedActions.push(tc.function.name);
    }

    // Step 3: Stream the final response with tool results
    const finalMessages = [
      ...aiMessages,
      choice.message, // assistant message with tool_calls
      ...toolResults,
    ];

    const finalResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: finalMessages,
        stream: true,
      }),
    });

    if (!finalResponse.ok) {
      const t = await finalResponse.text();
      console.error("AI final response error:", finalResponse.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Prepend a custom event so the client knows tools were executed
    const encoder = new TextEncoder();
    const toolEvent = encoder.encode(
      `data: ${JSON.stringify({ tool_actions: executedActions })}\n\n`
    );

    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();

    (async () => {
      await writer.write(toolEvent);
      const reader = finalResponse.body!.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        await writer.write(value);
      }
      await writer.close();
    })();

    return new Response(readable, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
