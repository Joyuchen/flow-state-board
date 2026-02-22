import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { User, Mail, Shield } from "lucide-react";

export default function SettingsView() {
  const { user, signOut } = useAuth();
  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "User";

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mb-6">
        <h1 className="font-heading text-xl font-bold">Settings</h1>
        <p className="text-xs text-muted-foreground">Manage your account and preferences</p>
      </div>

      <div className="max-w-lg space-y-6">
        {/* Profile */}
        <div className="rounded-xl border bg-card p-6">
          <h3 className="mb-4 text-sm font-semibold">Profile</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium">{displayName}</p>
                <p className="text-xs text-muted-foreground">Your display name</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{user?.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Account created {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="rounded-xl border bg-card p-6">
          <h3 className="mb-4 text-sm font-semibold">Account Actions</h3>
          <Button variant="destructive" onClick={signOut}>Sign Out</Button>
        </div>
      </div>
    </div>
  );
}
