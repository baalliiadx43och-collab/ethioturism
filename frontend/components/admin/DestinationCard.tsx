import { Destination, Category } from "@/store/slices/destinationApiSlice";
import { useGetDestinationSummaryQuery } from "@/store/slices/bookingApiSlice";
import Link from "next/link";

interface Props {
  item: Destination;
  category: Category;
  onDelete: (id: number) => void;
}

function getStatusBadge(item: Destination) {
  if (!item.isActive) return { label: "Inactive", cls: "bg-gray-100 text-gray-600" };
  return { label: "Active", cls: "bg-green-100 text-green-700" };
}

export default function DestinationCard({ item, category, onDelete }: Props) {
  const badge = getStatusBadge(item);
  const thumb = item.images?.[0] ?? null;

  // Fetch today's booking summary
  const { data: summary } = useGetDestinationSummaryQuery({
    category,
    destinationId: item.id,
  });

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <Link href={`/admin/${category}/${item.id}`} className="block">
        {/* Image */}
        <div className="h-40 bg-gray-100 relative">
          {thumb ? (
            <img src={thumb} alt={item.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">
              {category === "historical" ? "🏛️" : category === "parks" ? "🌿" : "🎉"}
            </div>
          )}
          <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-medium ${badge.cls}`}>
            {badge.label}
          </span>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
          <p className="text-xs text-gray-500 mt-0.5 truncate">📍 {item.location}</p>
          <div className="flex items-center justify-between mt-3">
            <div>
              <p className="text-xs text-gray-400">Base Price</p>
              <p className="text-sm font-semibold text-green-700">
                ETB {parseFloat(String(item.basePrice)).toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Total Bookings</p>
              {summary ? (
                <p className="text-sm text-gray-700">
                  <span className="font-bold text-orange-600">{summary.totalBooked}</span>
                  <span className="text-gray-400"> / </span>
                  <span className="font-bold">{summary.quota}</span>
                </p>
              ) : (
                <p className="text-sm text-gray-700">
                  <span className="font-bold">{item.dailyQuota}</span> total
                </p>
              )}
            </div>
          </div>
        </div>
      </Link>

      {/* Actions - Outside the link to prevent nested links */}
      <div className="flex gap-2 px-4 pb-4">
        <Link
          href={`/admin/${category}/${item.id}/edit`}
          className="flex-1 text-center px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
        >
          ✏️ Edit
        </Link>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(item.id);
          }}
          className="px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  );
}
