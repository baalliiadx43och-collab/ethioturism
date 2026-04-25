"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  useGetDestinationsQuery,
  useDeleteDestinationMutation,
  Destination,
  Category,
} from "@/store/slices/destinationApiSlice";
import {
  Landmark, Mountain, Music, Search, Plus,
  LayoutGrid, List, Filter, TrendingUp,
  MapPin, CheckCircle, XCircle, Layers,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type ViewMode = "grid" | "list";
type FilterCategory = "all" | Category;

interface MixedItem extends Destination {
  category: Category;
}

// ─── Category config ──────────────────────────────────────────────────────────

const CATEGORIES: {
  key: Category; label: string; icon: React.ElementType;
  color: string; textColor: string; bg: string; badge: string;
  gradient: string; ring: string;
}[] = [
  {
    key: "historical", label: "Historical Sites", icon: Landmark,
    color: "text-amber-600", textColor: "text-amber-700",
    bg: "bg-amber-50", badge: "bg-amber-100 text-amber-700",
    gradient: "from-amber-500 to-orange-500", ring: "ring-amber-200",
  },
  {
    key: "parks", label: "National Parks", icon: Mountain,
    color: "text-emerald-600", textColor: "text-emerald-700",
    bg: "bg-emerald-50", badge: "bg-emerald-100 text-emerald-700",
    gradient: "from-emerald-500 to-green-600", ring: "ring-emerald-200",
  },
  {
    key: "festivals", label: "Cultural Festivals", icon: Music,
    color: "text-purple-600", textColor: "text-purple-700",
    bg: "bg-purple-50", badge: "bg-purple-100 text-purple-700",
    gradient: "from-purple-500 to-violet-600", ring: "ring-purple-200",
  },
];

const EMOJI: Record<Category, string> = { historical: "🏛️", parks: "🌿", festivals: "🎉" };

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, icon: Icon, gradient, ring, href,
}: {
  label: string; value?: number; sub: string;
  icon: React.ElementType; gradient: string; ring: string; href: string;
}) {
  return (
    <Link
      href={href}
      className={`relative overflow-hidden rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all group ring-1 ${ring} bg-white`}
    >
      {/* Gradient blob */}
      <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br ${gradient} opacity-10 group-hover:opacity-20 transition-opacity`} />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
          <p className="text-4xl font-black text-gray-900 leading-none">
            {value ?? <span className="text-2xl text-gray-300 animate-pulse">—</span>}
          </p>
          <p className="text-xs text-gray-500 mt-2">{sub}</p>
        </div>
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-gray-400 group-hover:text-gray-600 transition-colors">
        <TrendingUp size={12} />
        Manage →
      </div>
    </Link>
  );
}

// ─── Distribution Bar ─────────────────────────────────────────────────────────

function DistributionBar({
  historical, parks, festivals, total,
}: {
  historical: number; parks: number; festivals: number; total: number;
}) {
  if (total === 0) return null;
  const pct = (n: number) => Math.round((n / total) * 100);
  const segments = [
    { label: "Historical", value: historical, pct: pct(historical), color: "bg-amber-400" },
    { label: "Parks",      value: parks,      pct: pct(parks),      color: "bg-emerald-500" },
    { label: "Festivals",  value: festivals,  pct: pct(festivals),  color: "bg-purple-500" },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 ring-1 ring-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Distribution</p>
          <p className="text-2xl font-black text-gray-900">{total} <span className="text-sm font-normal text-gray-400">total</span></p>
        </div>
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center shadow-md">
          <Layers size={20} className="text-white" />
        </div>
      </div>

      {/* Stacked bar */}
      <div className="flex h-3 rounded-full overflow-hidden gap-0.5 mb-4">
        {segments.map((s) => (
          <div
            key={s.label}
            className={`${s.color} transition-all duration-700`}
            style={{ width: `${s.pct}%` }}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-3 gap-2">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-sm ${s.color} shrink-0`} />
            <div>
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className="text-sm font-bold text-gray-800">{s.value} <span className="text-xs font-normal text-gray-400">({s.pct}%)</span></p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Active vs Inactive ───────────────────────────────────────────────────────

function ActiveRing({ active, inactive }: { active: number; inactive: number }) {
  const total = active + inactive;
  if (total === 0) return null;
  const activePct = Math.round((active / total) * 100);

  // SVG donut
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = (activePct / 100) * circ;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 ring-1 ring-gray-100 flex items-center gap-5">
      {/* Donut */}
      <div className="relative shrink-0">
        <svg width="72" height="72" viewBox="0 0 72 72">
          <circle cx="36" cy="36" r={r} fill="none" stroke="#f3f4f6" strokeWidth="8" />
          <circle
            cx="36" cy="36" r={r} fill="none"
            stroke="#10b981" strokeWidth="8"
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            transform="rotate(-90 36 36)"
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-black text-gray-900">{activePct}%</span>
        </div>
      </div>

      <div className="flex-1">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Status</p>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <CheckCircle size={13} className="text-emerald-500" />
              <span className="text-xs text-gray-600">Active</span>
            </div>
            <span className="text-sm font-bold text-gray-900">{active}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <XCircle size={13} className="text-gray-400" />
              <span className="text-xs text-gray-600">Inactive</span>
            </div>
            <span className="text-sm font-bold text-gray-900">{inactive}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Category Badge ───────────────────────────────────────────────────────────

function CategoryBadge({ category }: { category: Category }) {
  const cfg = CATEGORIES.find((c) => c.key === category)!;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.badge}`}>
      {EMOJI[category]} {cfg.label.split(" ")[0]}
    </span>
  );
}

// ─── Destination Cards ────────────────────────────────────────────────────────

function DestinationGridCard({
  item, onDelete,
}: {
  item: MixedItem; onDelete: (id: number, cat: Category) => void;
}) {
  const thumb = item.images?.[0] ?? null;
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all group">
      <Link href={`/admin/${item.category}/${item.id}`} className="block">
        <div className="h-40 bg-gray-100 relative overflow-hidden">
          {thumb ? (
            <img src={thumb} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl">{EMOJI[item.category]}</div>
          )}
          <div className="absolute top-2 left-2"><CategoryBadge category={item.category} /></div>
          <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-medium ${item.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
            {item.isActive ? "Active" : "Inactive"}
          </span>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
          <p className="text-xs text-gray-500 mt-0.5 truncate flex items-center gap-1"><MapPin size={10} />{item.location}</p>
          <div className="flex items-center justify-between mt-3">
            <div>
              <p className="text-xs text-gray-400">Base Price</p>
              <p className="text-sm font-bold text-emerald-700">ETB {parseFloat(String(item.basePrice)).toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Daily Quota</p>
              <p className="text-sm font-bold text-gray-700">{item.dailyQuota}</p>
            </div>
          </div>
        </div>
      </Link>
      <div className="flex gap-2 px-4 pb-4">
        <Link href={`/admin/${item.category}/${item.id}/edit`} className="flex-1 text-center px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">✏️ Edit</Link>
        <button onClick={() => onDelete(item.id, item.category)} className="px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">🗑️</button>
      </div>
    </div>
  );
}

function DestinationListRow({
  item, onDelete,
}: {
  item: MixedItem; onDelete: (id: number, cat: Category) => void;
}) {
  const thumb = item.images?.[0] ?? null;
  return (
    <div className="flex items-center gap-4 bg-white rounded-xl shadow-sm px-4 py-3 hover:shadow-md transition-all">
      <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0">
        {thumb ? <img src={thumb} alt={item.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl">{EMOJI[item.category]}</div>}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Link href={`/admin/${item.category}/${item.id}`} className="font-semibold text-gray-900 hover:text-emerald-700 truncate">{item.name}</Link>
          <CategoryBadge category={item.category} />
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{item.isActive ? "Active" : "Inactive"}</span>
        </div>
        <p className="text-xs text-gray-500 mt-0.5 truncate">📍 {item.location}</p>
      </div>
      <div className="hidden sm:flex items-center gap-6 shrink-0 text-right">
        <div><p className="text-xs text-gray-400">Price</p><p className="text-sm font-bold text-emerald-700">ETB {parseFloat(String(item.basePrice)).toLocaleString()}</p></div>
        <div><p className="text-xs text-gray-400">Quota</p><p className="text-sm font-bold text-gray-700">{item.dailyQuota}/day</p></div>
      </div>
      <div className="flex gap-2 shrink-0">
        <Link href={`/admin/${item.category}/${item.id}/edit`} className="px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">✏️ Edit</Link>
        <button onClick={() => onDelete(item.id, item.category)} className="px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">🗑️</button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminOverviewPage() {
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<FilterCategory>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [confirmDelete, setConfirmDelete] = useState<{ id: number; category: Category } | null>(null);

  const { data: historicalData, isLoading: hLoading } = useGetDestinationsQuery({ category: "historical", page: 1 });
  const { data: parksData,      isLoading: pLoading } = useGetDestinationsQuery({ category: "parks",      page: 1 });
  const { data: festivalsData,  isLoading: fLoading } = useGetDestinationsQuery({ category: "festivals",  page: 1 });
  const [deleteDestination, { isLoading: isDeleting }] = useDeleteDestinationMutation();

  const isLoading = hLoading || pLoading || fLoading;

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

  // Derived stats
  const totalDestinations = (historicalData?.total ?? 0) + (parksData?.total ?? 0) + (festivalsData?.total ?? 0);
  const activeCount = allItems.filter((i) => i.isActive).length;
  const inactiveCount = allItems.filter((i) => !i.isActive).length;

  const handleDelete = async () => {
    if (!confirmDelete) return;
    await deleteDestination({ category: confirmDelete.category, id: confirmDelete.id });
    setConfirmDelete(null);
  };

  return (
    <div className="space-y-6">

      {/* ── Hero Banner ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700 p-6 text-white shadow-lg">
        {/* decorative circles */}
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/5" />
        <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-white/5" />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-200 mb-1">Admin Dashboard</p>
          <h1 className="text-2xl font-black mb-1">Ethiopia Tourism</h1>
          <p className="text-sm text-emerald-100">
            {isLoading ? "Loading…" : `${totalDestinations} destinations across ${CATEGORIES.length} categories`}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.key}
                href={`/admin/${cat.key}/new`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/15 hover:bg-white/25 rounded-lg text-xs font-semibold transition-colors backdrop-blur-sm"
              >
                <Plus size={12} /> Add {cat.label.split(" ")[0]}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Stat Cards Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {CATEGORIES.map((cat) => {
          const counts: Record<string, number | undefined> = {
            historical: historicalData?.total,
            parks: parksData?.total,
            festivals: festivalsData?.total,
          };
          return (
            <StatCard
              key={cat.key}
              label={cat.label}
              value={counts[cat.key]}
              sub={`Manage ${cat.label.toLowerCase()}`}
              icon={cat.icon}
              gradient={cat.gradient}
              ring={cat.ring}
              href={`/admin/${cat.key}`}
            />
          );
        })}
      </div>

      {/* ── Distribution + Active Ring ── */}
      {!isLoading && totalDestinations > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DistributionBar
            historical={historicalData?.total ?? 0}
            parks={parksData?.total ?? 0}
            festivals={festivalsData?.total ?? 0}
            total={totalDestinations}
          />
          <ActiveRing active={activeCount} inactive={inactiveCount} />
        </div>
      )}

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

        {isLoading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400"><p className="text-5xl mb-3">🔍</p><p className="text-sm">No destinations match your search.</p></div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((item) => <DestinationGridCard key={`${item.category}-${item.id}`} item={item} onDelete={(id, cat) => setConfirmDelete({ id, category: cat })} />)}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((item) => <DestinationListRow key={`${item.category}-${item.id}`} item={item} onDelete={(id, cat) => setConfirmDelete({ id, category: cat })} />)}
          </div>
        )}
      </div>

      {/* ── Delete Modal ── */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🗑️</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Destination?</h3>
            <p className="text-sm text-gray-500 mb-6">This will permanently remove it and all associated images from Cloudinary.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 px-4 py-2.5 border border-gray-200 text-sm font-medium rounded-xl hover:bg-gray-50">Cancel</button>
              <button onClick={handleDelete} disabled={isDeleting} className="flex-1 px-4 py-2.5 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 disabled:opacity-60">
                {isDeleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
