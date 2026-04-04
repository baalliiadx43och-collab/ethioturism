import { ActivityLog } from "@/store/slices/superAdminApiSlice";

const actionColors: Record<string, string> = {
  CREATED_ADMIN: "bg-green-100 text-green-700",
  DELETED_ADMIN: "bg-red-100 text-red-700",
  DEACTIVATED_ADMIN: "bg-orange-100 text-orange-700",
  ACTIVATED_ADMIN: "bg-blue-100 text-blue-700",
  UPDATED_ADMIN: "bg-purple-100 text-purple-700",
  RESET_PASSWORD: "bg-yellow-100 text-yellow-700",
  CREATED_SITE: "bg-teal-100 text-teal-700",
  UPDATED_QUOTA: "bg-indigo-100 text-indigo-700",
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function ActivityFeedItem({ log }: { log: ActivityLog }) {
  const colorClass = actionColors[log.action] ?? "bg-gray-100 text-gray-600";

  return (
    <div className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
      <span className={`mt-0.5 px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${colorClass}`}>
        {log.action.replace(/_/g, " ")}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-700 truncate">
          <span className="font-medium">{log.adminName}</span>
          {log.targetName ? ` → ${log.targetName}` : ""}
        </p>
        {log.details && <p className="text-xs text-gray-400 truncate">{log.details}</p>}
      </div>
      <span className="text-xs text-gray-400 whitespace-nowrap">{timeAgo(log.createdAt)}</span>
    </div>
  );
}
