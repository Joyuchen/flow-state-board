import { useTasks } from "@/hooks/useTasks";
import { BarChart3 } from "lucide-react";

export default function AnalyticsView() {
  const { tasks } = useTasks();

  const statusData = [
    { label: "To Do", count: tasks.filter((t) => t.status === "todo").length, color: "bg-tag-blue" },
    { label: "In Progress", count: tasks.filter((t) => t.status === "in_progress").length, color: "bg-tag-orange" },
    { label: "Done", count: tasks.filter((t) => t.status === "done").length, color: "bg-tag-green" },
  ];

  const maxCount = Math.max(...statusData.map((d) => d.count), 1);

  // Tags frequency
  const tagMap: Record<string, number> = {};
  tasks.forEach((t) => t.tags?.forEach((tag) => { tagMap[tag] = (tagMap[tag] || 0) + 1; }));
  const topTags = Object.entries(tagMap).sort((a, b) => b[1] - a[1]).slice(0, 8);

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mb-6">
        <h1 className="font-heading text-xl font-bold">Analytics</h1>
        <p className="text-xs text-muted-foreground">Visual insights into your tasks</p>
      </div>

      {/* Bar chart */}
      <div className="rounded-xl border bg-card p-6">
        <h3 className="mb-6 text-sm font-semibold">Tasks by Status</h3>
        <div className="flex items-end gap-6 h-48">
          {statusData.map((d) => (
            <div key={d.label} className="flex flex-col items-center gap-2 flex-1">
              <span className="text-lg font-bold">{d.count}</span>
              <div
                className={`w-full rounded-t-lg ${d.color} transition-all`}
                style={{ height: `${(d.count / maxCount) * 100}%`, minHeight: d.count > 0 ? "16px" : "4px" }}
              />
              <span className="text-xs text-muted-foreground">{d.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div className="mt-6 rounded-xl border bg-card p-6">
        <h3 className="mb-4 text-sm font-semibold">Popular Tags</h3>
        {topTags.length === 0 ? (
          <p className="text-xs text-muted-foreground">No tags used yet</p>
        ) : (
          <div className="space-y-2">
            {topTags.map(([tag, count]) => (
              <div key={tag} className="flex items-center gap-3">
                <span className="w-24 truncate text-xs font-medium">{tag}</span>
                <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(count / topTags[0][1]) * 100}%` }} />
                </div>
                <span className="text-xs text-muted-foreground w-6 text-right">{count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
