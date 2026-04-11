"use client";

import Link from "next/link";
import { useGetDestinationsQuery } from "@/store/slices/destinationApiSlice";

function CategoryCard({ href, icon, label, count, color }: { href: string; icon: string; label: string; count?: number; color: string }) {
  return (
    <Link href={href} className={`block p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow ${color}`}>
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-lg font-bold text-gray-900">{label}</h3>
      <p className="text-sm text-gray-500 mt-1">{count ?? "..."} destinations</p>
      <p className="text-xs text-green-600 font-medium mt-3">Manage →</p>
    </Link>
  );
}

export default function AdminOverviewPage() {
  const { data: historical } = useGetDestinationsQuery({ category: "historical", page: 1 });
  const { data: parks } = useGetDestinationsQuery({ category: "parks", page: 1 });
  const { data: festivals } = useGetDestinationsQuery({ category: "festivals", page: 1 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Manage Ethiopia's tourism destinations</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <CategoryCard href="/admin/historical" icon="🏛️" label="Historical Sites" count={historical?.total} color="bg-amber-50" />
        <CategoryCard href="/admin/parks" icon="🌿" label="National Parks" count={parks?.total} color="bg-green-50" />
        <CategoryCard href="/admin/festivals" icon="🎉" label="Cultural Festivals" count={festivals?.total} color="bg-green-50" />
      </div>

      <div className="bg-white rounded-xl shadow-sm p-5">
        <h2 className="text-base font-semibold text-gray-800 mb-3">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          {[
            { href: "/admin/historical/new", label: "+ Add Historical Site" },
            { href: "/admin/parks/new", label: "+ Add National Park" },
            { href: "/admin/festivals/new", label: "+ Add Cultural Festival" },
          ].map(a => (
            <Link key={a.href} href={a.href}
              className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors">
              {a.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
