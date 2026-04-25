"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useGetOverviewQuery } from "@/store/slices/superAdminApiSlice";
import { useGetDestinationsQuery, Destination, Category } from "@/store/slices/destinationApiSlice";
import ActivityFeedItem from "@/components/super-admin/ActivityFeedItem";
import {
  Search, LayoutGrid, List, Filter,
  Landmark, Mountain, Music,
  Users, UserCheck, UserX, UserCog,
  Activity, TrendingUp, MapPin,
  CheckCircle, XCircle, Layers,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type ViewMode = "grid" | "list";
type FilterCategory = "all" | Category;
interface MixedItem extends Destination { category: Category; }

// ─── Category config ──────────────────────────────────────────────────────────

const DEST_CATS: {
  key: Category; label: string; icon: React.ElementType;
  color: string; bg: string; badge: string; gradient: string; ring: string;
}[] = [
  { key: "historical", label: "Historical Sites",   icon: Landmark, color: "text-amber-600",   bg: "bg-amber-50",   badge: "bg-amber-100 text-amber-700",   gradient: "from-amber-500 to-orange-500",  ring: "ring-amber-200"   },
  { key: "parks",      label: "National Parks",     icon: Mountain, color: "text-emerald-600", bg: "bg-emerald-50", badge: "bg-emerald-100 text-emerald-700", gradient: "from-emerald-500 to-green-600", ring: "ring-emerald-200" },
  { key: "festivals",  label: "Cultural Festivals", icon: Music,    color: "text-purple-600",  bg: "bg-purple-50",  badge: "bg-purple-100 text-purple-700",  gradient: "from-purple-500 to-violet-600", ring: "ring-purple-200"  },
];

const EMOJI: Record<Category, string> = { historical: "🏛️", parks: "🌿", festivals: "🎉" };

// ─── Gradient Stat Card ───────────────────────────────────────────────────────

function GradientStatCard({
  label, value, sub, icon: Icon, gradient, href,
}: {
  label: string; value: number | string; sub: string;
  icon: React.ElementType; gradient: string; href?: string;
}) {
  const inner = (
    <div className={`relative overflow-hidden rounded-2xl p-5 text-white shadow-md hover:shadow-xl transition-all group bg-gradient-to-br ${gradient}`}>
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10 group-hover:bg-white/15 transition-colors" />
      <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/5" />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-white/70 mb-1">{label}</p>
          <p className="text-4xl font-black leading-none">{value}</p>
          <p className="text-xs text-white/70 mt-2">{sub}</p>
        </div>
        <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
          <Icon size={20} className="text-white" />
        </div>
      </div>
      {href && (
        <div className="relative mt-4 flex items-center gap-1 text-xs font-semibold text-white/60 group-hover:text-white/90 transition-colors">
          <TrendingUp size={11} /> View details →
        </div>
      )}
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

// ─── Mini Bar Chart (activity breakdown) ─────────────────────────────────────

function ActivityBarChart({ breakdown }: { breakdown: { targetType: string; count: number }[] }) {
  const max = Math.max(...breakdown.map((b) => b.count), 1);
  const colors = ["bg-emerald-500", "bg-amber-500", "bg-purple-500", "bg-blue-500", "bg-rose-500"];

  return (
    <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Activity Breakdown</p>
          <p className="text-sm font-bold text-gray-700 mt-0.5">Last 30 days</p>
        </div>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
          <Activity size={16} className="text-white" />
        </div>
      </div>

      <div className="space-y-3">
        {breakdown.map((item, i) => {
          const pct = Math.round((item.count / max) * 100);
          const total = breakdown.reduce((s, b) => s + b.count, 0);
          const share = total > 0 ? Math.round((item.count / total) * 100) : 0;
          return (
            <div key={item.targetType}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-600 font-medium capitalize">{item.targetType.replace(/_/g, " ")}</span>
                <span className="text-gray-400">{item.count} <span className="text-gray-300">({share}%)</span></span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${colors[i % colors.length]} transition-all duration-700`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── User Breakdown Card ──────────────────────────────────────────────────────

function UserBreakdown({
  total, active, blocked, newToday,
}: {
  total: number; active: number; blocked: number; newToday: number;
}) {
  const activePct = total > 0 ? Math.round((active / total) * 100) : 0;
  const r = 30;
  const circ = 2 * Math.PI * r;
  const dash = (activePct / 100) * circ;

  return (
    <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Users</p>
          <p className="text-3xl font-black text-gray-900">{total}</p>
        </div>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
          <Users size={16} className="text-white" />
        </div>
      </div>

      <div className="flex items-center gap-5">
        {/* Donut */}
        <div className="relative shrink-0">
          <svg width="76" height="76" viewBox="0 0 76 76">
            <circle cx="38" cy="38" r={r} fill="none" stroke="#f3f4f6" strokeWidth="9" />
            <circle
              cx="38" cy="38" r={r} fill="none"
              stroke="#3b82f6" strokeWidth="9"
              strokeDasharray={`${dash} ${circ}`}
              strokeLinecap="round"
              transform="rotate(-90 38 38)"
              className="transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-black text-gray-900">{activePct}%</span>
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5"><UserCheck size={13} className="text-blue-500" /><span className="text-xs text-gray-600">Active</span></div>
            <span className="text-sm font-bold text-gray-900">{active}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5"><UserX size={13} className="text-red-400" /><span className="text-xs text-gray-600">Blocked</span></div>
            <span className="text-sm font-bold text-gray-900">{blocked}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5"><TrendingUp size={13} className="text-emerald-500" /><span className="text-xs text-gray-600">New today</span></div>
            <span className="text-sm font-bold text-emerald-600">+{newToday}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Destination Distribution ─────────────────────────────────────────────────

function DestDistribution({
  historical, parks, festivals,
}: {
  historical: number; parks: number; festivals: number;
}) {
  const total = historical + parks + festivals;
  if (total === 0) return null;
  const pct = (n: number) => Math.round((n / total) * 100);
  const segments = [
    { label: "Historical", value: historical, pct: pct(historical), color: "bg-amber-400" },
    { label: "Parks",      value: parks,      pct: pct(parks),      color: "bg-emerald-500" },
    { label: "Festivals",  value: festivals,  pct: pct(festivals),  color: "bg-purple-500" },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Destinations</p>
          <p className="text-3xl font-black text-gray-900">{total}</p>
        </div>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
          <Layers size={16} className="text-white" />
        </div>
      </div>

      <div className="flex h-2.5 rounded-full overflow-hidden gap-0.5 mb-4">
        {segments.map((s) => (
          <div key={s.label} className={`${s.color} transition-all duration-700`} style={{ width: `${s.pct}%` }} />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {segments.map((s) => (
          <div key={s.label} className="flex items-start gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-sm ${s.color} mt-0.5 shrink-0`} />
            <div>
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className="text-sm font-bold text-gray-800">{s.value}</p>
              <p className="text-xs text-gray-400">{s.pct}%</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Category Badge ───────────────────────────────────────────────────────────

function CategoryBadge({ category }: { category: Category }) {
  const cfg = DEST_CATS.find((c) => c.key === category)!;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.badge}`}>
      {EMOJI[category]} {cfg.label.split(" ")[0]}
    </span>
  );
}

// ─── Destination Cards ────────────────────────────────────────────────────────

function DestinationGridCard({ item }: { item: MixedItem }) {
  const thumb = item.images?.[0] ?? null;
  return (
    <Link href={`/admin/${item.category}/${item.id}`} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all group block">
      <div className="h-36 bg-gray-100 relative overflow-hidden">
        {thumb ? <img src={thumb} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /> : <div className="w-full h-full flex items-center justify-center text-5xl">{EMOJI[item.category]}</div>}
        <div className="absolute top-2 left-2"><CategoryBadge category={item.category} /></div>
        <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-medium ${item.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{item.isActive ? "Active" : "Inactive"}</span>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
        <p className="text-xs text-gray-500 mt-0.5 truncate flex items-center gap-1"><MapPin size={10} />{item.location}</p>
        <div className="flex items-center justify-between mt-3">
          <div><p className="text-xs text-gray-400">Base Price</p><p className="text-sm font-bold text-emerald-700">ETB {parseFloat(String(item.basePrice)).toLocaleString()}</p></div>
          <div className="text-right"><p className="text-xs text-gray-400">Daily Quota</p><p className="text-sm font-bold text-gray-700">{item.dailyQuota}</p></div>
        </div>
      </div>
    </Link>
  );
}

function DestinationListRow({ item }: { item: MixedItem }) {
  const thumb = item.images?.[0] ?? null;
  return (
    <Link href={`/admin/${item.category}/${item.id}`} className="flex items-center gap-4 bg-white rounded-xl shadow-sm px-4 py-3 hover:shadow-md transition-all">
      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
        {thumb ? <img src={thumb} alt={item.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xl">{EMOJI[item.category]}</div>}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-gray-900 truncate">{item.name}</span>
          <CategoryBadge category={item.category} />
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{item.isActive ? "Active" : "Inactive"}</span>
        </div>
        <p className="text-xs text-gray-500 mt-0.5 truncate">📍 {item.location}</p>
      </div>
      <div className="hidden sm:flex items-center gap-6 shrink-0 text-right">
        <div><p className="text-xs text-gray-400">Price</p><p className="text-sm font-bold text-emerald-700">ETB {parseFloat(String(item.basePrice)).toLocaleString()}</p></div>
        <div><p className="text-xs text-gray-400">Quota</p><p className="text-sm font-bold text-gray-700">{item.dailyQuota}/day</p></div>
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
    return [...h, ...p, ...f].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [historicalData, parksData, festivalsData]);

  const filtered = useMemo(() => allItems.filter((item) => {
    const matchCat = filterCat === "all" || item.category === filterCat;
    const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase()) || item.location.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  }), [allItems, filterCat, search]);

  const totalDest = (historicalData?.total ?? 0) + (parksData?.total ?? 0) + (festivalsData?.total ?? 0);
  const totalActivity = overview?.activityBreakdown.reduce((s, i) => s + i.count, 0) ?? 0;

  if (overviewLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600" />
      </div>
    );
  }

  if (isError || !overview) {
    return <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg">Failed to load overview data.</div>;
  }

  return (
    <div className="space-y-6">

      {/* ── Hero Banner ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 p-6 text-white shadow-lg">
        <div className="absolute -top-10 -right-10 w-52 h-52 rounded-full bg-white/5" />
        <div className="absolute top-4 right-4 w-24 h-24 rounded-full bg-emerald-500/10" />
        <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-white/5" />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">Super Admin</p>
          <h1 className="text-2xl font-black mb-1">Platform Overview</h1>
          <p className="text-sm text-slate-300">Real-time snapshot of the Ethio Tourism platform</p>

          {/* Quick stats inline */}
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total Users",   value: overview.users.total,   icon: Users },
              { label: "Active Admins", value: overview.admins.active, icon: UserCog },
              { label: "Destinations",  value: totalDest,              icon: Layers },
              { label: "Actions (30d)", value: totalActivity,          icon: Activity },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2.5">
                <div className="flex items-center gap-2 mb-1">
                  <Icon size={13} className="text-white/60" />
                  <p className="text-xs text-white/60">{label}</p>
                </div>
                <p className="text-xl font-black">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Top Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GradientStatCard label="Total Users"   value={overview.users.total}   sub={`+${overview.users.newToday} new today`}       icon={Users}     gradient="from-blue-500 to-indigo-600"    href="/super-admin/users" />
        <GradientStatCard label="Active Users"  value={overview.users.active}  sub={`${overview.users.blocked} blocked`}            icon={UserCheck} gradient="from-emerald-500 to-teal-600"   href="/super-admin/users" />
        <GradientStatCard label="Total Admins"  value={overview.admins.total}  sub={`${overview.admins.active} active`}             icon={UserCog}   gradient="from-violet-500 to-purple-600"  href="/super-admin/admins" />
        <GradientStatCard label="Actions (30d)" value={totalActivity}          sub="Total logged actions"                           icon={Activity}  gradient="from-rose-500 to-pink-600"      href="/super-admin/activity" />
      </div>

      {/* ── Analytics Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <UserBreakdown
          total={overview.users.total}
          active={overview.users.active}
          blocked={overview.users.blocked}
          newToday={overview.users.newToday}
        />
        <DestDistribution
          historical={historicalData?.total ?? 0}
          parks={parksData?.total ?? 0}
          festivals={festivalsData?.total ?? 0}
        />
        {overview.activityBreakdown.length > 0 && (
          <ActivityBarChart breakdown={overview.activityBreakdown} />
        )}
      </div>

      {/* ── Destination Category Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {DEST_CATS.map((cat) => {
          const counts: Record<string, number | undefined> = {
            historical: historicalData?.total,
            parks: parksData?.total,
            festivals: festivalsData?.total,
          };
          return (
            <GradientStatCard
              key={cat.key}
              label={cat.label}
              value={counts[cat.key] ?? 0}
              sub={`Manage ${cat.label.toLowerCase()}`}
              icon={cat.icon}
              gradient={cat.gradient}
              href={`/admin/${cat.key}`}
            />
          );
        })}
      </div>

      {/* ── All Destinations ── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <h2 className="text-lg font-bold text-gray-900 shrink-0">
            All Destinations
            <span className="ml-2 text-sm font-normal text-gray-400">({filtered.length} shown)</span>
          </h2>

          <div className="relative flex-1 max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or location…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <Filter size={13} className="text-gray-400 ml-1" />
            {(["all", "historical", "parks", "festivals"] as FilterCategory[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilterCat(f)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${filterCat === f ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                {f === "all" ? "All" : f === "historical" ? "Historical" : f === "parks" ? "Parks" : "Festivals"}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 shrink-0">
            <button onClick={() => setViewMode("grid")} className={`p-1.5 rounded-md transition-colors ${viewMode === "grid" ? "bg-white shadow-sm text-gray-900" : "text-gray-400 hover:text-gray-600"}`}><LayoutGrid size={15} /></button>
            <button onClick={() => setViewMode("list")} className={`p-1.5 rounded-md transition-colors ${viewMode === "list" ? "bg-white shadow-sm text-gray-900" : "text-gray-400 hover:text-gray-600"}`}><List size={15} /></button>
          </div>
        </div>

        {destLoading ? (
          <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400"><p className="text-5xl mb-3">🔍</p><p className="text-sm">No destinations match your search.</p></div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((item) => <DestinationGridCard key={`${item.category}-${item.id}`} item={item} />)}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((item) => <DestinationListRow key={`${item.category}-${item.id}`} item={item} />)}
          </div>
        )}
      </div>

      {/* ── Recent Activity ── */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Recent Activity</p>
            <p className="text-sm font-bold text-gray-700 mt-0.5">Latest admin actions</p>
          </div>
          <Link href="/super-admin/activity" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
            View all →
          </Link>
        </div>
        {overview.recentActivity.length === 0 ? (
          <p className="text-sm text-gray-400">No activity yet.</p>
        ) : (
          <div className="space-y-1">
            {overview.recentActivity.map((log) => (
              <ActivityFeedItem key={log.id} log={log} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
