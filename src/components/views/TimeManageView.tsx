import { useTasks } from "@/hooks/useTasks";
import { Clock } from "lucide-react";
import { format } from "date-fns";

export default function TimeManageView() {
  const { tasks } = useTasks();

  const tasksWithEstimate = tasks.filter((t) => t.time_estimate && t.time_estimate > 0);
  const totalMinutes = tasksWithEstimate.reduce((sum, t) => sum + (t.time_estimate || 0), 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMins = totalMinutes % 60;

  const byStatus = {
    todo: tasks.filter((t) => t.status === "todo" && t.time_estimate).reduce((s, t) => s + (t.time_estimate || 0), 0),
    in_progress: tasks.filter((t) => t.status === "in_progress" && t.time_estimate).reduce((s, t) => s + (t.time_estimate || 0), 0),
    done: tasks.filter((t) => t.status === "done" && t.time_estimate).reduce((s, t) => s + (t.time_estimate || 0), 0),
  };

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mb-6">
        <h1 className="font-heading text-xl font-bold">Time Management</h1>
        <p className="text-xs text-muted-foreground">Track time estimates across your tasks</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-5">
          <Clock className="mb-2 h-5 w-5 text-primary" />
          <p className="text-2xl font-bold">{totalHours}h {remainingMins}m</p>
          <p className="text-xs text-muted-foreground">Total Estimated</p>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <p className="text-2xl font-bold">{byStatus.todo}m</p>
          <p className="text-xs text-muted-foreground">To Do</p>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <p className="text-2xl font-bold">{byStatus.in_progress}m</p>
          <p className="text-xs text-muted-foreground">In Progress</p>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <p className="text-2xl font-bold">{byStatus.done}m</p>
          <p className="text-xs text-muted-foreground">Completed</p>
        </div>
      </div>

      {/* Task list with estimates */}
      <div className="mt-8">
        <h2 className="mb-4 font-heading text-lg font-semibold">Tasks with Time Estimates</h2>
        <div className="space-y-2">
          {tasksWithEstimate.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tasks have time estimates yet. Add estimates when creating tasks!</p>
          ) : (
            tasksWithEstimate.map((task) => (
              <div key={task.id} className="flex items-center justify-between rounded-xl border bg-card p-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{task.title}</p>
                  <p className="text-xs text-muted-foreground capitalize">{task.status.replace("_", " ")}</p>
                </div>
                <div className="flex items-center gap-1 text-sm font-semibold text-primary">
                  <Clock className="h-3.5 w-3.5" />
                  {task.time_estimate}m
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
