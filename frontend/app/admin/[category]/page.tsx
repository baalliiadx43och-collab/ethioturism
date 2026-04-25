"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  useGetDestinationsQuery,
  useDeleteDestinationMutation,
  Category,
} from "@/store/slices/destinationApiSlice";
import DestinationCard from "@/components/admin/DestinationCard";

const CATEGORY_LABELS: Record<string, string> = {
  historical: "Historical Sites",
  parks: "National Parks",
  festivals: "Cultural Festivals",
};

export default function DestinationListPage() {
  const { category } = useParams<{ category: string }>();
  const cat = category as Category;

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const { data, isLoading, isFetching } = useGetDestinationsQuery({ category: cat, search, page });
  const [deleteDestination] = useDeleteDestinationMutation();

  const handleDelete = async () => {
    if (!confirmDelete) return;
    await deleteDestination({ category: cat, id: confirmDelete });
    setConfirmDelete(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{CATEGORY_LABELS[cat] ?? cat}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{data?.total ?? 0} destinations</p>
        </div>
        <Link
          href={`/admin/${cat}/new`}
          className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
        >
          + Add New
        </Link>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by name..."
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        className="w-full max-w-sm px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />

      {/* Grid */}
      {isLoading || isFetching ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600" />
        </div>
      ) : data?.items.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">{cat === "historical" ? "🏛️" : cat === "parks" ? "🌿" : "🎉"}</p>
          <p className="text-sm">No destinations yet. Add your first one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {data?.items.map((item) => (
            <DestinationCard
              key={item.id}
              item={item}
              category={cat}
              onDelete={(id) => setConfirmDelete(id)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.pages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-gray-500">Page {data.page} of {data.pages}</p>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
              className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40">Prev</button>
            <button disabled={page === data.pages} onClick={() => setPage(p => p + 1)}
              className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40">Next</button>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 text-center">
            <p className="text-3xl mb-3">🗑️</p>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Destination?</h3>
            <p className="text-sm text-gray-500 mb-5">This will permanently remove it and all associated images from Cloudinary.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
