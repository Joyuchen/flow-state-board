import { useState, useCallback } from "react";
import { DndContext, DragEndEvent, DragOverEvent, DragStartEvent, PointerSensor, useSensor, useSensors, closestCorners, DragOverlay } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useTasks, Task, TaskStatus } from "@/hooks/useTasks";
import KanbanColumn from "./KanbanColumn";
import AddTaskDialog from "./AddTaskDialog";
import TaskCard from "./TaskCard";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const COLUMNS: TaskStatus[] = ["todo", "in_progress", "done"];

export default function KanbanBoard() {
  const { tasks, isLoading, addTask, updateTask, deleteTask, getTasksByStatus } = useTasks();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const activeTask = tasks.find((t) => t.id === active.id);
    if (!activeTask) return;

    // Dropped over a column
    const newStatus = COLUMNS.includes(over.id as TaskStatus) ? (over.id as TaskStatus) : undefined;
    // Or dropped over another task
    const overTask = tasks.find((t) => t.id === over.id);
    const targetStatus = newStatus || overTask?.status;

    if (targetStatus && targetStatus !== activeTask.status) {
      try {
        await updateTask.mutateAsync({ id: activeTask.id, status: targetStatus });
      } catch {
        toast.error("Failed to move task");
      }
    }
  };

  const handleAddTask = async (task: Parameters<typeof addTask.mutateAsync>[0]) => {
    try {
      await addTask.mutateAsync(task);
      toast.success("Task created!");
    } catch {
      toast.error("Failed to create task");
    }
  };

  const handleEditTask = async (task: Parameters<typeof addTask.mutateAsync>[0]) => {
    if (!editingTask) return;
    try {
      await updateTask.mutateAsync({ id: editingTask.id, ...task });
      toast.success("Task updated!");
      setEditingTask(null);
    } catch {
      toast.error("Failed to update task");
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await deleteTask.mutateAsync(id);
      toast.success("Task deleted");
    } catch {
      toast.error("Failed to delete task");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex flex-1 gap-4 overflow-x-auto p-6 pb-4">
          {COLUMNS.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              tasks={getTasksByStatus(status)}
              onEditTask={(t) => setEditingTask(t)}
              onDeleteTask={handleDeleteTask}
            />
          ))}
        </div>
        <DragOverlay>
          {activeTask && (
            <div className="w-[320px]">
              <TaskCard task={activeTask} onEdit={() => {}} onDelete={() => {}} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <AddTaskDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSubmit={handleAddTask}
      />

      {editingTask && (
        <AddTaskDialog
          open={!!editingTask}
          onOpenChange={(open) => { if (!open) setEditingTask(null); }}
          onSubmit={handleEditTask}
          editingTask={editingTask}
        />
      )}
    </>
  );
}

export { KanbanBoard };
