import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task, TaskPriority } from "@/hooks/useTasks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Calendar, MoreHorizontal, Pencil, Trash2, GripVertical } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const priorityConfig: Record<TaskPriority, { label: string; className: string }> = {
  high: { label: "High", className: "bg-priority-high/15 text-priority-high border-priority-high/30" },
  medium: { label: "Medium", className: "bg-priority-medium/15 text-priority-medium border-priority-medium/30" },
  low: { label: "Low", className: "bg-priority-low/15 text-priority-low border-priority-low/30" },
};

const tagColors = [
  "bg-tag-blue/15 text-tag-blue",
  "bg-tag-green/15 text-tag-green",
  "bg-tag-purple/15 text-tag-purple",
  "bg-tag-orange/15 text-tag-orange",
  "bg-tag-pink/15 text-tag-pink",
];

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export default function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { task },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priority = priorityConfig[task.priority as TaskPriority];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group rounded-xl border bg-card p-4 shadow-sm transition-all hover:shadow-md",
        isDragging && "rotate-2 shadow-xl opacity-90 ring-2 ring-primary/20"
      )}
    >
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <button {...attributes} {...listeners} className="cursor-grab text-muted-foreground/40 hover:text-muted-foreground active:cursor-grabbing">
            <GripVertical className="h-4 w-4" />
          </button>
          <Badge variant="outline" className={cn("text-[10px] font-semibold", priority.className)}>
            {priority.label}
          </Badge>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(task)}>
              <Pencil className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(task.id)} className="text-destructive focus:text-destructive">
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <h4 className="mb-1.5 font-heading text-sm font-semibold leading-tight">{task.title}</h4>
      {task.description && (
        <p className="mb-3 text-xs text-muted-foreground line-clamp-2">{task.description}</p>
      )}

      <div className="flex flex-wrap items-center gap-1.5">
        {task.tags?.map((tag, i) => (
          <span key={tag} className={cn("rounded-md px-2 py-0.5 text-[10px] font-medium", tagColors[i % tagColors.length])}>
            {tag}
          </span>
        ))}
      </div>

      {task.due_date && (
        <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {format(new Date(task.due_date), "MMM d, yyyy")}
        </div>
      )}
    </div>
  );
}
