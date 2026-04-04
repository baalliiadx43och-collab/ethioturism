"use client";

import { useGetOverviewQuery } from "@/store/slices/superAdminApiSlice";
import StatCard from "@/components/super-admin/StatCard";
import ActivityFeedItem from "@/components/super-admin/ActivityFeedItem";

export default function SuperAdminOverviewPage() {
  const { data, isLoading, isError } = useGetOverviewQuery();
  const overview = data?.overview;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600" />
      </div>
    );
  }

  if (isError || !overview) {
    return (
      <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
        Failed to load overview data.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platform Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Real-time snapshot of the Ethio Tourism platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Users"
          value={overview.users.total}
          icon="🧑‍🤝‍🧑"
          color="bg-blue-50"
          sub={`${overview.users.newToday} new today`}
        />
        <StatCard
          label="Active Users"
          value={overview.users.active}
          icon="✅"
          color="bg-green-50"
          sub={`${overview.users.blocked} blocked`}
        />
        <StatCard
          label="Total Admins"
          value={overview.admins.total}
          icon="👤"
          color="bg-purple-50"
          sub={`${overview.admins.active} active`}
        />
        <StatCard
          label="Activity (30d)"
          value={overview.activityBreakdown.reduce((s, i) => s + i.count, 0)}
          icon="📋"
          color="bg-yellow-50"
          sub="Total logged actions"
        />
      </div>

      {/* Activity Breakdown */}
      {overview.activityBreakdown.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Activity Breakdown (Last 30 Days)</h2>
          <div className="space-y-3">
            {overview.activityBreakdown.map((item) => {
              const total = overview.activityBreakdown.reduce((s, i) => s + i.count, 0);
              const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
              return (
                <div key={item._id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 capitalize">{item._id.replace("_", " ")}</span>
                    <span className="font-medium text-gray-800">{item.count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Recent Activity</h2>
        {overview.recentActivity.length === 0 ? (
          <p className="text-sm text-gray-400">No activity yet.</p>
        ) : (
          <div className="space-y-2">
            {overview.recentActivity.map((log) => (
              <ActivityFeedItem key={log._id} log={log} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
