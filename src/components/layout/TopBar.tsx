import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TopBarProps {
  onAddTask: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function TopBar({ onAddTask, searchQuery, onSearchChange }: TopBarProps) {
  return (
    <header className="flex items-center justify-between border-b bg-card px-6 py-3">
      <div>
        <h1 className="font-heading text-xl font-bold">Board</h1>
        <p className="text-xs text-muted-foreground">Manage and track your tasks</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            className="w-[220px] pl-9"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <Button onClick={onAddTask} className="gap-2">
          <Plus className="h-4 w-4" /> Add Task
        </Button>
      </div>
    </header>
  );
}
