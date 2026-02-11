import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AppSidebar from "@/components/layout/AppSidebar";
import TopBar from "@/components/layout/TopBar";
import KanbanBoard from "@/components/kanban/KanbanBoard";
import AddTaskDialog from "@/components/kanban/AddTaskDialog";
import AIChatPanel from "@/components/chat/AIChatPanel";
import AIChatFullPage from "@/components/chat/AIChatFullPage";
import { useTasks } from "@/hooks/useTasks";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function Index() {
  const { user, loading } = useAuth();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeView, setActiveView] = useState<"board" | "assistant">("board");
  const { addTask } = useTasks();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  const handleAddTask = async (task: Parameters<typeof addTask.mutateAsync>[0]) => {
    try {
      await addTask.mutateAsync(task);
      toast.success("Task created!");
    } catch {
      toast.error("Failed to create task");
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar activeView={activeView} onViewChange={setActiveView} />
      <div className="flex flex-1 flex-col overflow-hidden">
        {activeView === "board" && (
          <>
            <TopBar onAddTask={() => setAddDialogOpen(true)} searchQuery={searchQuery} onSearchChange={setSearchQuery} />
            <KanbanBoard />
          </>
        )}
        {activeView === "assistant" && <AIChatFullPage />}
      </div>
      {activeView === "board" && <AIChatPanel />}

      <AddTaskDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSubmit={handleAddTask}
      />
    </div>
  );
}
