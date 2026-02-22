import { MessageCircle } from "lucide-react";

export default function ChatView() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center p-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
        <MessageCircle className="h-8 w-8 text-muted-foreground/40" />
      </div>
      <h2 className="font-heading text-xl font-bold">Team Chat</h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Chat with your team members in real-time. This feature is coming soon — stay tuned!
      </p>
    </div>
  );
}
