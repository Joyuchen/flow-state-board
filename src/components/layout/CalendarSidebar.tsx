import { useTasks } from "@/hooks/useTasks";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";

const tagColors = [
  "bg-tag-blue text-white",
  "bg-tag-green text-white",
  "bg-tag-purple text-white",
  "bg-tag-orange text-white",
  "bg-tag-pink text-white",
];

export default function CalendarSidebar() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { tasks } = useTasks();

  // Get tasks with due dates to show as schedule items
  const scheduledTasks = tasks
    .filter((t) => t.due_date)
    .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
    .slice(0, 6);

  // Dates that have tasks
  const taskDates = tasks
    .filter((t) => t.due_date)
    .map((t) => new Date(t.due_date!));

  return (
    <aside className="hidden xl:flex h-screen w-[300px] shrink-0 flex-col border-l bg-card overflow-y-auto">
      {/* Calendar Header */}
      <div className="px-4 pt-5 pb-2">
        <h3 className="font-heading text-sm font-semibold">Calendar</h3>
        <p className="text-xs text-muted-foreground">
          {format(new Date(), "EEEE, d MMMM yyyy")}
        </p>
      </div>

      {/* Mini Calendar */}
      <div className="px-2">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="p-3 pointer-events-auto"
          modifiers={{ hasTask: taskDates }}
          modifiersClassNames={{ hasTask: "bg-primary/10 font-bold" }}
        />
      </div>

      {/* Schedule */}
      <div className="flex-1 px-4 pb-4">
        <h4 className="mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Upcoming Tasks</h4>
        {scheduledTasks.length === 0 ? (
          <p className="text-xs text-muted-foreground/60">No scheduled tasks</p>
        ) : (
          <div className="space-y-2.5">
            {scheduledTasks.map((task, i) => (
              <div key={task.id} className="flex items-start gap-2.5 rounded-lg border p-2.5">
                <div className={cn("mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full", tagColors[i % tagColors.length].split(" ")[0])} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium leading-tight truncate">{task.title}</p>
                  <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span>{format(new Date(task.due_date!), "MMM d")}</span>
                    {task.time_estimate && (
                      <span className="flex items-center gap-0.5">
                        <Clock className="h-2.5 w-2.5" />
                        {task.time_estimate}m
                      </span>
                    )}
                    <span className="capitalize">{task.priority}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
