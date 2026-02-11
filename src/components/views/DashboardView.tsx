import { useTasks } from "@/hooks/useTasks";
import { BarChart3, CheckCircle2, Clock, ListTodo, TrendingUp } from "lucide-react";

export default function DashboardView() {
  const { tasks } = useTasks();

  const todoCount = tasks.filter((t) => t.status === "todo").length;
  const inProgressCount = tasks.filter((t) => t.status === "in_progress").length;
  const doneCount = tasks.filter((t) => t.status === "done").length;
  const highPriority = tasks.filter((t) => t.priority === "high").length;
  const totalEstimate = tasks.reduce((sum, t) => sum + (t.time_estimate || 0), 0);
  const completionRate = tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0;

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mb-6">
        <h1 className="font-heading text-xl font-bold">Dashboard</h1>
        <p className="text-xs text-muted-foreground">Detailed view of your project metrics</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {[
          { label: "To Do", value: todoCount, icon: ListTodo, color: "text-tag-blue" },
          { label: "In Progress", value: inProgressCount, icon: TrendingUp, color: "text-tag-orange" },
          { label: "Completed", value: doneCount, icon: CheckCircle2, color: "text-tag-green" },
          { label: "High Priority", value: highPriority, icon: BarChart3, color: "text-priority-high" },
          { label: "Completion Rate", value: `${completionRate}%`, icon: TrendingUp, color: "text-tag-purple" },
          { label: "Total Estimate", value: `${totalEstimate}m`, icon: Clock, color: "text-tag-pink" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border bg-card p-5">
            <stat.icon className={`mb-2 h-5 w-5 ${stat.color}`} />
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Priority breakdown */}
      <div className="mt-8">
        <h2 className="mb-4 font-heading text-lg font-semibold">Tasks by Priority</h2>
        <div className="space-y-3">
          {(["high", "medium", "low"] as const).map((p) => {
            const count = tasks.filter((t) => t.priority === p).length;
            const pct = tasks.length > 0 ? (count / tasks.length) * 100 : 0;
            return (
              <div key={p} className="flex items-center gap-3">
                <span className="w-16 text-xs font-medium capitalize">{p}</span>
                <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${p === "high" ? "bg-priority-high" : p === "medium" ? "bg-priority-medium" : "bg-priority-low"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-8 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
