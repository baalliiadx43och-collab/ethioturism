"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useRouter } from "next/navigation";
import {
  useGetPublicDestinationsQuery,
  type Category,
} from "@/store/slices/publicDestinationApiSlice";
import { useGetMyBookingsQuery } from "@/store/slices/bookingApiSlice";
import { 
  Mountain, MapPin, Loader2, ChevronLeft, ChevronRight, 
  TrendingUp, Calendar, Star, Sparkles, ArrowRight
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import UserLayout from "@/components/user/UserLayout";

export default function DashboardPage() {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState<Category | "">("");
  const [page, setPage] = useState(1);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (mounted && !isAuthenticated) router.replace("/login");
  }, [mounted, isAuthenticated, router]);

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading, isFetching } = useGetPublicDestinationsQuery(
    { category: category as Category, search: debouncedSearch, page },
    { skip: !mounted }
  );

  const { data: bookingsData } = useGetMyBookingsQuery(undefined, {
    skip: !mounted || !isAuthenticated,
  });

  if (!mounted || !isAuthenticated) return null;

  const handleCategoryChange = (val: string) => {
    setCategory(val as Category | "");
    setPage(1);
  };

  const upcomingBookings = bookingsData?.bookings?.filter(
    b => b.status !== "CANCELLED" && new Date(b.bookingDate) >= new Date()
  ).length || 0;

  const totalBookings = bookingsData?.count || 0;

  return (
    <UserLayout
      search={search}
      onSearchChange={(v) => setSearch(v)}
      activeCategory={category}
      onCategoryChange={handleCategoryChange}
    >
      {/* Welcome Banner */}
      <div className="mb-6 bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold mb-1">
              Welcome back, {user?.name.split(" ")[0]}! 👋
            </h1>
            <p className="text-green-50 text-sm">
              Discover the beauty and culture of Ethiopia
            </p>
          </div>
          <div className="flex gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 text-center">
              <div className="text-2xl font-bold">{totalBookings}</div>
              <div className="text-xs text-green-50">Total Trips</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 text-center">
              <div className="text-2xl font-bold">{upcomingBookings}</div>
              <div className="text-xs text-green-50">Upcoming</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      {!category && !search && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <TrendingUp size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Popular Now</p>
                <p className="text-lg font-bold text-gray-900">{data?.total || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <Calendar size={20} className="text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Next Trip</p>
                <p className="text-lg font-bold text-gray-900">
                  {upcomingBookings > 0 ? `${upcomingBookings} Booked` : "Plan One"}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                <Star size={20} className="text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Experiences</p>
                <p className="text-lg font-bold text-gray-900">Explore</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            {category
              ? category === "historical"
                ? "Historical Sites"
                : category === "parks"
                ? "National Parks"
                : "Cultural Festivals"
              : "Explore Destinations"}
            {!category && !search && <Sparkles size={20} className="text-yellow-500" />}
          </h2>
          {data && (
            <p className="text-sm text-gray-500 mt-1">
              {data.total} destination{data.total !== 1 ? "s" : ""} available
            </p>
          )}
        </div>
        {upcomingBookings > 0 && (
          <Link 
            href="/bookings"
            className="hidden sm:flex items-center gap-2 text-sm text-green-600 hover:text-green-700 font-medium"
          >
            View My Trips
            <ArrowRight size={16} />
          </Link>
        )}
      </div>

      {/* Grid */}
      {isLoading || isFetching ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={32} className="animate-spin text-green-600" />
        </div>
      ) : !data?.items?.length ? (
        <div className="text-center py-24 text-gray-400">
          <Mountain size={48} className="mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">No destinations found</p>
          <p className="text-sm mt-1">Try a different search or category</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {data.items.map((dest) => (
            <Link
              key={dest._id}
              href={`/destination/${dest.category}/${dest._id}`}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-green-200"
            >
              <div className="relative h-52 bg-gray-200 overflow-hidden">
                {dest.images?.[0] ? (
                  <Image
                    src={dest.images[0]}
                    alt={dest.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <Mountain size={40} />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="absolute top-3 left-3 px-3 py-1.5 text-xs font-semibold bg-white/95 backdrop-blur-sm text-gray-700 rounded-full capitalize shadow-sm">
                  {dest.category === "parks"
                    ? "National Park"
                    : dest.category === "historical"
                    ? "Historical"
                    : "Festival"}
                </span>
              </div>

              <div className="p-5">
                <h3 className="font-bold text-gray-900 text-base leading-snug group-hover:text-green-700 transition-colors line-clamp-2 mb-2">
                  {dest.name}
                </h3>
                <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-4">
                  <MapPin size={14} className="shrink-0" />
                  <span className="line-clamp-1">{dest.location}</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div>
                    <span className="text-xs text-gray-400 block">Starting from</span>
                    <p className="text-green-700 font-bold text-lg">
                      {dest.basePrice.toLocaleString()} <span className="text-sm">ETB</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs px-4 py-2 bg-green-50 text-green-700 rounded-full font-semibold group-hover:bg-green-600 group-hover:text-white transition-colors">
                    Explore
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.pages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(5, data.pages) }, (_, i) => {
              let pageNum;
              if (data.pages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= data.pages - 2) {
                pageNum = data.pages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                    page === pageNum
                      ? "bg-green-600 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
            disabled={page === data.pages}
            className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </UserLayout>
  );
}
