import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { useEffect } from "react";

export type Task = Tables<"tasks">;
export type TaskInsert = TablesInsert<"tasks">;
export type TaskUpdate = TablesUpdate<"tasks">;
export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export function useTasks() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("position", { ascending: true });
      if (error) throw error;
      return data as Task[];
    },
    enabled: !!user,
  });

  // Realtime subscription
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("tasks-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, () => {
        queryClient.invalidateQueries({ queryKey: ["tasks", user.id] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, queryClient]);

  const addTask = useMutation({
    mutationFn: async (task: Omit<TaskInsert, "user_id">) => {
      const { data, error } = await supabase
        .from("tasks")
        .insert({ ...task, user_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks", user?.id] }),
  });

  const updateTask = useMutation({
    mutationFn: async ({ id, ...updates }: TaskUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("tasks")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks", user?.id] }),
  });

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks", user?.id] }),
  });

  const getTasksByStatus = (status: TaskStatus) =>
    tasks.filter((t) => t.status === status);

  return { tasks, isLoading, addTask, updateTask, deleteTask, getTasksByStatus };
}
