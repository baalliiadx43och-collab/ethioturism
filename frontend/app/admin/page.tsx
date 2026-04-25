"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  useGetDestinationsQuery,
  useDeleteDestinationMutation,
  Destination,
  Category,
} from "@/store/slices/destinationApiSlice";
import { Landmark, Mountain, Music, Search, Plus, LayoutGrid, List, Filter } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type ViewMode = "grid" | "list";
type FilterCategory = "all" | Category;

interface MixedItem extends Destination {
  category: Category;
}

// ─── Category config ──────────────────────────────────────────────────────────

const CATEGORIES: { key: Category; label: string; icon: React.ElementType; color: string; bg: string; badge: string }[] = [
  { key: "historical", label: "Historical Sites", icon: Landmark, color: "text-amber-600", bg: "bg-amber-50", badge: "bg-amber-100 text-amber-700" },
  { key: "parks",      label: "National Parks",   icon: Mountain, color: "text-green-600",  bg: "bg-green-50",  badge: "bg-green-100 text-green-700"  },
  { key: "festivals",  label: "Cultural Festivals", icon: Music,  color: "text-purple-600", bg: "bg-purple-50", badge: "bg-purple-100 text-purple-700" },
];

const EMOJI: Record<Category, string> = { historical: "🏛️", parks: "🌿", festivals: "🎉" };

// ─── Sub-components ───────────────────────────────────────────────────────────

function SummaryCard({
  label, count, icon: Icon, color, bg, href,
}: {
  label: string; count?: number; icon: React.ElementType;
  color: string; bg: string; href: string;
}) {
  return (
    <Link href={href} className={`flex items-center gap-4 p-5 rounded-xl shadow-sm hover:shadow-md transition-all ${bg} group`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-white shadow-sm`}>
        <Icon size={22} className={color} />
      </div>
      <div className="flex-1">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{count ?? "—"}</p>
      </div>
      <span className={`text-xs font-semibold ${color} opacity-0 group-hover:opacity-100 transition-opacity`}>
        Manage →
      </span>
    </Link>
  );
}

function CategoryBadge({ category }: { category: Category }) {
  const cfg = CATEGORIES.find((c) => c.key === category)!;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.badge}`}>
      {EMOJI[category]} {cfg.label.split(" ")[0]}
    </span>
  );
}

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
      <div className="flex gap-2 px-4 pb-4">
        <Link
          href={`/admin/${item.category}/${item.id}/edit`}
          className="flex-1 text-center px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
        >
          ✏️ Edit
        </Link>
        <button
          onClick={() => onDelete(item.id, item.category)}
          className="px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
        >
          🗑️
        </button>
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
        {thumb ? (
          <img src={thumb} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">
            {EMOJI[item.category]}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href={`/admin/${item.category}/${item.id}`}
            className="font-semibold text-gray-900 hover:text-green-700 truncate"
          >
            {item.name}
          </Link>
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
      <div className="flex gap-2 shrink-0">
        <Link
          href={`/admin/${item.category}/${item.id}/edit`}
          className="px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
        >
          ✏️ Edit
        </Link>
        <button
          onClick={() => onDelete(item.id, item.category)}
          className="px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
        >
          🗑️
        </button>
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

  // Fetch all three categories (page 1, large limit to show all on dashboard)
  const { data: historicalData, isLoading: hLoading } = useGetDestinationsQuery({ category: "historical", page: 1 });
  const { data: parksData,      isLoading: pLoading } = useGetDestinationsQuery({ category: "parks",      page: 1 });
  const { data: festivalsData,  isLoading: fLoading } = useGetDestinationsQuery({ category: "festivals",  page: 1 });

  const [deleteDestination, { isLoading: isDeleting }] = useDeleteDestinationMutation();

  const isLoading = hLoading || pLoading || fLoading;

  // Mix all items together and tag with category
  const allItems = useMemo<MixedItem[]>(() => {
    const h = (historicalData?.items ?? []).map((i) => ({ ...i, category: "historical" as Category }));
    const p = (parksData?.items ?? []).map((i) => ({ ...i, category: "parks" as Category }));
    const f = (festivalsData?.items ?? []).map((i) => ({ ...i, category: "festivals" as Category }));
    return [...h, ...p, ...f].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [historicalData, parksData, festivalsData]);

  // Filter by category + search
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

  const handleDelete = async () => {
    if (!confirmDelete) return;
    await deleteDestination({ category: confirmDelete.category, id: confirmDelete.id });
    setConfirmDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Manage all of Ethiopia's tourism destinations</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {CATEGORIES.map((cat) => {
          const counts: Record<string, number | undefined> = {
            historical: historicalData?.total,
            parks: parksData?.total,
            festivals: festivalsData?.total,
          };
          return (
            <SummaryCard
              key={cat.key}
              label={cat.label}
              count={counts[cat.key]}
              icon={cat.icon}
              color={cat.color}
              bg={cat.bg}
              href={`/admin/${cat.key}`}
            />
          );
        })}
      </div>

      {/* Quick add */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Quick Add</p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.key}
              href={`/admin/${cat.key}/new`}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus size={14} />
              {cat.label.split(" ")[0]}
            </Link>
          ))}
        </div>
      </div>

      {/* All destinations section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <h2 className="text-lg font-bold text-gray-900 shrink-0">
            All Destinations
            <span className="ml-2 text-sm font-normal text-gray-400">
              ({filtered.length} shown)
            </span>
          </h2>

          {/* Search */}
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

          {/* Category filter */}
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

          {/* View toggle */}
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

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-5xl mb-3">🔍</p>
            <p className="text-sm">No destinations match your search.</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((item) => (
              <DestinationGridCard
                key={`${item.category}-${item.id}`}
                item={item}
                onDelete={(id, cat) => setConfirmDelete({ id, category: cat })}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((item) => (
              <DestinationListRow
                key={`${item.category}-${item.id}`}
                item={item}
                onDelete={(id, cat) => setConfirmDelete({ id, category: cat })}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete confirm modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 text-center">
            <p className="text-3xl mb-3">🗑️</p>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Destination?</h3>
            <p className="text-sm text-gray-500 mb-5">
              This will permanently remove it and all associated images from Cloudinary.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-60"
              >
                {isDeleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
