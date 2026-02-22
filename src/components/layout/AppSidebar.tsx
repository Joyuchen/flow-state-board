import { LayoutDashboard, LogOut, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function AppSidebar() {
  const { user, signOut } = useAuth();
  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "User";

  return (
    <aside className="flex h-screen w-[240px] shrink-0 flex-col border-r bg-sidebar">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
          <LayoutDashboard className="h-4.5 w-4.5 text-primary-foreground" />
        </div>
        <span className="font-heading text-lg font-bold">FlowBoard</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2">
        <div className={cn(
          "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium",
          "bg-sidebar-accent text-sidebar-accent-foreground"
        )}>
          <LayoutDashboard className="h-4 w-4" />
          Board
        </div>
      </nav>

      {/* User */}
      <div className="border-t p-3">
        <div className="flex items-center gap-2.5 rounded-xl px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium">{displayName}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={signOut} className="h-8 w-8 shrink-0">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
