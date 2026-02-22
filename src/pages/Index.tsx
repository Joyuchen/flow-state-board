import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AppSidebar, { ViewType } from "@/components/layout/AppSidebar";
import TopBar from "@/components/layout/TopBar";
import CalendarSidebar from "@/components/layout/CalendarSidebar";
import KanbanBoard from "@/components/kanban/KanbanBoard";
import AddTaskDialog from "@/components/kanban/AddTaskDialog";
import AIChatPanel from "@/components/chat/AIChatPanel";
import AIChatFullPage from "@/components/chat/AIChatFullPage";
import HomeView from "@/components/views/HomeView";
import DashboardView from "@/components/views/DashboardView";
import AnalyticsView from "@/components/views/AnalyticsView";
import ChatView from "@/components/views/ChatView";
import TimeManageView from "@/components/views/TimeManageView";
import SettingsView from "@/components/views/SettingsView";
import { useTasks } from "@/hooks/useTasks";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function Index() {
  const { user, loading } = useAuth();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeView, setActiveView] = useState<ViewType>("home");
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

  const showCalendar = activeView === "home" || activeView === "board" || activeView === "dashboard";

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
        {activeView === "home" && <HomeView />}
        {activeView === "dashboard" && <DashboardView />}
        {activeView === "analytics" && <AnalyticsView />}
        {activeView === "chat" && <ChatView />}
        {activeView === "time-manage" && <TimeManageView />}
        {activeView === "ai-assistant" && <AIChatFullPage />}
        {activeView === "settings" && <SettingsView />}
      </div>
      {showCalendar && <CalendarSidebar />}
      {activeView === "board" && <AIChatPanel />}

      <AddTaskDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSubmit={handleAddTask}
      />
    </div>
  );
}
