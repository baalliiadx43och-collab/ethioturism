"use client";

import { useState } from "react";
import { useGetActivityLogsQuery } from "@/store/slices/superAdminApiSlice";
import ActivityFeedItem from "@/components/super-admin/ActivityFeedItem";

const TARGET_TYPES = ["", "HISTORICAL_SITE", "PARK", "FESTIVAL", "USER", "ADMIN", "BOOKING"];

export default function ActivityFeedPage() {
  const [page, setPage] = useState(1);
  const [targetType, setTargetType] = useState("");

  const { data, isLoading, isFetching } = useGetActivityLogsQuery({ page, targetType });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Activity Feed</h1>
        <p className="text-sm text-gray-500 mt-0.5">Full audit trail of all admin actions</p>
      </div>

      {/* Filter */}
      <div className="flex gap-3">
        <select
          value={targetType}
          onChange={(e) => { setTargetType(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          {TARGET_TYPES.map((t) => (
            <option key={t} value={t}>{t || "All Types"}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-5">
        {isLoading || isFetching ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
          </div>
        ) : data?.logs.length === 0 ? (
          <p className="text-center text-gray-400 py-12 text-sm">No activity logs found.</p>
        ) : (
          <div className="space-y-1">
            {data?.logs.map((log) => (
              <ActivityFeedItem key={log._id} log={log} />
            ))}
          </div>
        )}

        {data && data.pages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              {data.total} total logs — Page {data.page} of {data.pages}
            </p>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40">Prev</button>
              <button disabled={page === data.pages} onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
