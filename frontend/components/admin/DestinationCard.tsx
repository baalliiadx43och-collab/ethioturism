import { Destination, Category } from "@/store/slices/destinationApiSlice";
import Link from "next/link";

interface Props {
  item: Destination;
  category: Category;
  onDelete: (id: string) => void;
}

function getStatusBadge(item: Destination) {
  // Check today's quota usage — we don't have booking count here,
  // so we show based on isActive and quota as a proxy
  if (!item.isActive) return { label: "Inactive", cls: "bg-gray-100 text-gray-600" };
  return { label: "Active", cls: "bg-green-100 text-green-700" };
}

export default function DestinationCard({ item, category, onDelete }: Props) {
  const badge = getStatusBadge(item);
  const thumb = item.images[0] ?? null;

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
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
            <p className="text-sm font-semibold text-emerald-700">ETB {item.basePrice.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Daily Quota</p>
            <p className="text-sm font-semibold text-gray-700">{item.dailyQuota} visitors</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <Link
            href={`/admin/${category}/${item._id}`}
            className="flex-1 text-center px-3 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors"
          >
            Manage
          </Link>
          <button
            onClick={() => onDelete(item._id)}
            className="px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
