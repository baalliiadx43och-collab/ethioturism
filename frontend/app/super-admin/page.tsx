"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useGetOverviewQuery } from "@/store/slices/superAdminApiSlice";
import { useGetDestinationsQuery, Destination, Category } from "@/store/slices/destinationApiSlice";
import StatCard from "@/components/super-admin/StatCard";
import ActivityFeedItem from "@/components/super-admin/ActivityFeedItem";
import { Search, LayoutGrid, List, Filter, Landmark, Mountain, Music } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type ViewMode = "grid" | "list";
type FilterCategory = "all" | Category;

interface MixedItem extends Destination {
  category: Category;
}

// ─── Category config ──────────────────────────────────────────────────────────

const CATEGORIES: {
  key: Category; label: string; icon: React.ElementType;
  color: string; bg: string; badge: string;
}[] = [
  { key: "historical", label: "Historical Sites",   icon: Landmark, color: "text-amber-600",  bg: "bg-amber-50",  badge: "bg-amber-100 text-amber-700"  },
  { key: "parks",      label: "National Parks",     icon: Mountain, color: "text-green-600",  bg: "bg-green-50",  badge: "bg-green-100 text-green-700"  },
  { key: "festivals",  label: "Cultural Festivals", icon: Music,    color: "text-purple-600", bg: "bg-purple-50", badge: "bg-purple-100 text-purple-700" },
];

const EMOJI: Record<Category, string> = { historical: "🏛️", parks: "🌿", festivals: "🎉" };

// ─── Sub-components ───────────────────────────────────────────────────────────

function CategoryBadge({ category }: { category: Category }) {
  const cfg = CATEGORIES.find((c) => c.key === category)!;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.badge}`}>
      {EMOJI[category]} {cfg.label.split(" ")[0]}
    </span>
  );
}

function DestinationGridCard({ item }: { item: MixedItem }) {
  const thumb = item.images?.[0] ?? null;
  return (
    <Link
      href={`/admin/${item.category}/${item.id}`}
      className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all group block"
    >
      <div className="h-36 bg-gray-100 relative overflow-hidden">
        {thumb ? (
          <img
            src={thumb}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">
            {EMOJI[item.category]}
          </div>
        )}
        <div className="absolute top-2 left-2">
          <CategoryBadge category={item.category} />
        </div>
        <span
          className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-medium ${
            item.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
          }`}
        >
          {item.isActive ? "Active" : "Inactive"}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
        <p className="text-xs text-gray-500 mt-0.5 truncate">📍 {item.location}</p>
        <div className="flex items-center justify-between mt-3">
          <div>
            <p className="text-xs text-gray-400">Base Price</p>
            <p className="text-sm font-bold text-green-700">
              ETB {parseFloat(String(item.basePrice)).toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Daily Quota</p>
            <p className="text-sm font-bold text-gray-700">{item.dailyQuota}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}

function DestinationListRow({ item }: { item: MixedItem }) {
  const thumb = item.images?.[0] ?? null;
  return (
    <Link
      href={`/admin/${item.category}/${item.id}`}
      className="flex items-center gap-4 bg-white rounded-xl shadow-sm px-4 py-3 hover:shadow-md transition-all"
    >
      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
        {thumb ? (
          <img src={thumb} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xl">
            {EMOJI[item.category]}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-gray-900 truncate">{item.name}</span>
          <CategoryBadge category={item.category} />
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              item.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
            }`}
          >
            {item.isActive ? "Active" : "Inactive"}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-0.5 truncate">📍 {item.location}</p>
      </div>
      <div className="hidden sm:flex items-center gap-6 shrink-0 text-right">
        <div>
          <p className="text-xs text-gray-400">Price</p>
          <p className="text-sm font-bold text-green-700">
            ETB {parseFloat(String(item.basePrice)).toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Quota</p>
          <p className="text-sm font-bold text-gray-700">{item.dailyQuota}/day</p>
        </div>
      </div>
    </Link>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SuperAdminOverviewPage() {
  const { data: overviewData, isLoading: overviewLoading, isError } = useGetOverviewQuery();
  const overview = overviewData?.overview;

  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<FilterCategory>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const { data: historicalData, isLoading: hLoading } = useGetDestinationsQuery({ category: "historical", page: 1 });
  const { data: parksData,      isLoading: pLoading } = useGetDestinationsQuery({ category: "parks",      page: 1 });
  const { data: festivalsData,  isLoading: fLoading } = useGetDestinationsQuery({ category: "festivals",  page: 1 });

  const destLoading = hLoading || pLoading || fLoading;

  const allItems = useMemo<MixedItem[]>(() => {
    const h = (historicalData?.items ?? []).map((i) => ({ ...i, category: "historical" as Category }));
    const p = (parksData?.items ?? []).map((i) => ({ ...i, category: "parks" as Category }));
    const f = (festivalsData?.items ?? []).map((i) => ({ ...i, category: "festivals" as Category }));
    return [...h, ...p, ...f].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [historicalData, parksData, festivalsData]);

  const filtered = useMemo(() => {
    return allItems.filter((item) => {
      const matchCat = filterCat === "all" || item.category === filterCat;
      const matchSearch =
        !search ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.location.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [allItems, filterCat, search]);

  if (overviewLoading) {
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
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platform Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Real-time snapshot of the Ethio Tourism platform</p>
      </div>

      {/* User / Admin Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Users"
          value={overview.users.total}
          icon="🧑‍🤝‍🧑"
          color="bg-green-50"
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
          color="bg-green-50"
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

      {/* Destination summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {CATEGORIES.map((cat) => {
          const counts: Record<string, number | undefined> = {
            historical: historicalData?.total,
            parks: parksData?.total,
            festivals: festivalsData?.total,
          };
          const Icon = cat.icon;
          return (
            <Link
              key={cat.key}
              href={`/admin/${cat.key}`}
              className={`flex items-center gap-4 p-5 rounded-xl shadow-sm hover:shadow-md transition-all ${cat.bg} group`}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white shadow-sm">
                <Icon size={22} className={cat.color} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{cat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{counts[cat.key] ?? "—"}</p>
              </div>
              <span className={`text-xs font-semibold ${cat.color} opacity-0 group-hover:opacity-100 transition-opacity`}>
                View →
              </span>
            </Link>
          );
        })}
      </div>

      {/* All Destinations */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <h2 className="text-lg font-bold text-gray-900 shrink-0">
            All Destinations
            <span className="ml-2 text-sm font-normal text-gray-400">
              ({filtered.length} shown)
            </span>
          </h2>

          <div className="relative flex-1 max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or location…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <Filter size={13} className="text-gray-400 ml-1" />
            {(["all", "historical", "parks", "festivals"] as FilterCategory[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilterCat(f)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors capitalize ${
                  filterCat === f
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {f === "all" ? "All" : f === "historical" ? "Historical" : f === "parks" ? "Parks" : "Festivals"}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 shrink-0">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-colors ${viewMode === "grid" ? "bg-white shadow-sm text-gray-900" : "text-gray-400 hover:text-gray-600"}`}
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-md transition-colors ${viewMode === "list" ? "bg-white shadow-sm text-gray-900" : "text-gray-400 hover:text-gray-600"}`}
            >
              <List size={15} />
            </button>
          </div>
        </div>

        {destLoading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-3">🔍</p>
            <p className="text-sm">No destinations match your search.</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((item) => (
              <DestinationGridCard key={`${item.category}-${item.id}`} item={item} />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((item) => (
              <DestinationListRow key={`${item.category}-${item.id}`} item={item} />
            ))}
          </div>
        )}
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
                <div key={item.targetType}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 capitalize">{item.targetType.replace("_", " ")}</span>
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
              <ActivityFeedItem key={log.id} log={log} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
