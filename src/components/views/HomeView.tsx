import { useTasks } from "@/hooks/useTasks";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { CheckCircle2, Clock, ListTodo, TrendingUp } from "lucide-react";

export default function HomeView() {
  const { user } = useAuth();
  const { tasks } = useTasks();
  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "User";

  const todoCount = tasks.filter((t) => t.status === "todo").length;
  const inProgressCount = tasks.filter((t) => t.status === "in_progress").length;
  const doneCount = tasks.filter((t) => t.status === "done").length;

  const stats = [
    { label: "To Do", value: todoCount, icon: ListTodo, color: "text-tag-blue" },
    { label: "In Progress", value: inProgressCount, icon: TrendingUp, color: "text-tag-orange" },
    { label: "Done", value: doneCount, icon: CheckCircle2, color: "text-tag-green" },
    { label: "Total Tasks", value: tasks.length, icon: Clock, color: "text-tag-purple" },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold">Welcome back, {displayName}! 👋</h1>
        <p className="mt-1 text-sm text-muted-foreground">Here's an overview of your workspace</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border bg-card p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent tasks */}
      <div className="mt-8">
        <h2 className="mb-4 font-heading text-lg font-semibold">Recent Tasks</h2>
        <div className="space-y-2">
          {tasks.slice(0, 5).map((task) => (
            <div key={task.id} className="flex items-center justify-between rounded-xl border bg-card p-4">
              <div>
                <p className="text-sm font-medium">{task.title}</p>
                <p className="text-xs text-muted-foreground capitalize">{task.status.replace("_", " ")} · {task.priority} priority</p>
              </div>
              {task.due_date && (
                <span className="text-xs text-muted-foreground">{format(new Date(task.due_date), "MMM d")}</span>
              )}
            </div>
          ))}
          {tasks.length === 0 && <p className="text-sm text-muted-foreground">No tasks yet. Create your first task!</p>}
        </div>
      </div>
    </div>
  );
}
