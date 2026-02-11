import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Task, TaskStatus } from "@/hooks/useTasks";
import TaskCard from "./TaskCard";
import { cn } from "@/lib/utils";
import { Circle, Clock, CheckCircle2 } from "lucide-react";

const columnConfig: Record<TaskStatus, { title: string; icon: React.ElementType; bgClass: string; iconClass: string }> = {
  todo: { title: "To Do", icon: Circle, bgClass: "bg-kanban-todo", iconClass: "text-muted-foreground" },
  in_progress: { title: "In Progress", icon: Clock, bgClass: "bg-kanban-progress", iconClass: "text-primary" },
  done: { title: "Done", icon: CheckCircle2, bgClass: "bg-kanban-done", iconClass: "text-priority-low" },
};

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
}

export default function KanbanColumn({ status, tasks, onEditTask, onDeleteTask }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const config = columnConfig[status];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex h-full min-w-[320px] flex-1 flex-col rounded-2xl p-4 transition-colors",
        config.bgClass,
        isOver && "ring-2 ring-primary/30 ring-inset"
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={cn("h-4 w-4", config.iconClass)} />
          <h3 className="font-heading text-sm font-semibold">{config.title}</h3>
        </div>
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-foreground/5 text-xs font-medium">
          {tasks.length}
        </span>
      </div>

      <div ref={setNodeRef} className="flex flex-1 flex-col gap-3 overflow-y-auto scrollbar-thin">
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onEdit={onEditTask} onDelete={onDeleteTask} />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <div className="flex flex-1 items-center justify-center rounded-xl border-2 border-dashed border-foreground/5 p-8">
            <p className="text-xs text-muted-foreground/50">Drop tasks here</p>
          </div>
        )}
      </div>
    </div>
  );
}
