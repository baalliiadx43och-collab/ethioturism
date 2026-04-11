"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useRouter } from "next/navigation";
import {
  useGetMyBookingsQuery,
  useCancelBookingMutation,
} from "@/store/slices/bookingApiSlice";
import {
  CalendarDays, Users, Loader2, MapPin,
  XCircle, CheckCircle2, Clock, Filter,
  TrendingUp, DollarSign, Package, ArrowRight,
} from "lucide-react";
import Link from "next/link";
import UserLayout from "@/components/user/UserLayout";

const STATUS_STYLES: Record<string, string> = {
  CONFIRMED: "bg-green-50 text-green-700 border-green-200",
  PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
  CANCELLED: "bg-red-50 text-red-500 border-red-200",
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  CONFIRMED: <CheckCircle2 size={14} />,
  PENDING: <Clock size={14} />,
  CANCELLED: <XCircle size={14} />,
};

export default function BookingsPage() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"ALL" | "CONFIRMED" | "PENDING" | "CANCELLED">("ALL");

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (mounted && !isAuthenticated) router.replace("/login");
  }, [mounted, isAuthenticated, router]);

  const { data, isLoading } = useGetMyBookingsQuery(undefined, {
    skip: !mounted || !isAuthenticated,
  });
  const [cancelBooking, { isLoading: cancelling }] = useCancelBookingMutation();
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  if (!mounted || !isAuthenticated) return null;

  const handleCancel = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    setCancellingId(id);
    try { await cancelBooking(id).unwrap(); } catch {}
    setCancellingId(null);
  };

  const filteredBookings = data?.bookings?.filter(b => 
    filterStatus === "ALL" ? true : b.status === filterStatus
  ) || [];

  const upcomingCount = data?.bookings?.filter(
    b => b.status !== "CANCELLED" && new Date(b.bookingDate) >= new Date()
  ).length || 0;

  const totalSpent = data?.bookings?.filter(b => b.status !== "CANCELLED")
    .reduce((sum, b) => sum + b.totalPrice, 0) || 0;

  const confirmedCount = data?.bookings?.filter(b => b.status === "CONFIRMED").length || 0;

  return (
    <UserLayout>
      {/* Header with Stats */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">My Bookings</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm mb-1">Total Bookings</p>
                <p className="text-3xl font-bold">{data?.count || 0}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Package size={24} />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm mb-1">Upcoming Trips</p>
                <p className="text-3xl font-bold">{upcomingCount}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <TrendingUp size={24} />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm mb-1">Total Spent</p>
                <p className="text-2xl font-bold">{totalSpent.toLocaleString()} ETB</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <DollarSign size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={16} className="text-gray-400" />
          {(["ALL", "CONFIRMED", "PENDING", "CANCELLED"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === status
                  ? "bg-green-600 text-white shadow-sm"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              {status === "ALL" ? "All" : status.charAt(0) + status.slice(1).toLowerCase()}
              {status !== "ALL" && (
                <span className="ml-1.5 text-xs opacity-75">
                  ({data?.bookings?.filter(b => b.status === status).length || 0})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={32} className="animate-spin text-green-600" />
        </div>
      ) : !filteredBookings.length ? (
        <div className="text-center py-24 text-gray-400">
          <CalendarDays size={48} className="mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">
            {filterStatus === "ALL" ? "No bookings yet" : `No ${filterStatus.toLowerCase()} bookings`}
          </p>
          <Link 
            href="/dashboard" 
            className="mt-4 inline-flex items-center gap-2 text-sm text-green-600 hover:text-green-700 font-medium"
          >
            Explore destinations
            <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => {
            const isPast = new Date(b.bookingDate) < new Date();
            const isUpcoming = !isPast && b.status !== "CANCELLED";
            
            return (
              <div
                key={b._id}
                className={`bg-white rounded-2xl border shadow-sm p-5 transition-all hover:shadow-md ${
                  isUpcoming ? "border-green-200 bg-green-50/30" : "border-gray-100"
                }`}
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-lg">{b.destinationName}</h3>
                        <p className="text-sm text-gray-500 capitalize mt-0.5">
                          {b.destinationType.replace("Site", " Site")}
                        </p>
                      </div>
                      <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${STATUS_STYLES[b.status]}`}>
                        {STATUS_ICONS[b.status]}
                        {b.status}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                          <CalendarDays size={16} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Date</p>
                          <p className="font-medium text-gray-900">
                            {new Date(b.bookingDate).toLocaleDateString("en-US", {
                              month: "short", day: "numeric", year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                          <Users size={16} className="text-purple-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Guests</p>
                          <p className="font-medium text-gray-900">
                            {b.numberOfPeople} {b.numberOfPeople === 1 ? "person" : "people"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                          <MapPin size={16} className="text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Total Price</p>
                          <p className="font-bold text-green-700">
                            {b.totalPrice.toLocaleString()} ETB
                          </p>
                        </div>
                      </div>
                    </div>

                    {b.notes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Notes:</p>
                        <p className="text-sm text-gray-700">{b.notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                  <div className="text-xs text-gray-400">
                    Booked on {new Date(b.createdAt).toLocaleDateString("en-US", {
                      month: "short", day: "numeric", year: "numeric",
                    })}
                  </div>
                  {b.status !== "CANCELLED" && (
                    <button
                      onClick={() => handleCancel(b._id)}
                      disabled={cancelling && cancellingId === b._id}
                      className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 font-medium"
                    >
                      {cancelling && cancellingId === b._id ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          Cancelling...
                        </>
                      ) : (
                        <>
                          <XCircle size={14} />
                          Cancel Booking
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </UserLayout>
  );
}
