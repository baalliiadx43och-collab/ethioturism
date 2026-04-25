"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import {
  useGetDestinationQuery,
  useUpdateDestinationMutation,
  useUpdateQuotaMutation,
  useGetBookingsQuery,
  Category,
} from "@/store/slices/destinationApiSlice";
import { useGetDestinationSummaryQuery } from "@/store/slices/bookingApiSlice";

type Tab = "details" | "quota" | "bookings";

export default function DestinationDetailPage() {
  const { category, id } = useParams<{ category: string; id: string }>();
  const cat = category as Category;
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("details");

  const { data, isLoading } = useGetDestinationQuery({ category: cat, id });
  const { data: summary } = useGetDestinationSummaryQuery({ category: cat, destinationId: id });
  const [updateDestination, { isLoading: updating }] = useUpdateDestinationMutation();
  const [updateQuota, { isLoading: quotaLoading }] = useUpdateQuotaMutation();

  // Quota form
  const { register: rq, handleSubmit: hq, reset: resetQuota } = useForm<{ date: string; availableQuota: number; eventName: string }>();

  // Bookings
  const [bookingPage, setBookingPage] = useState(1);
  const [bookingStatus, setBookingStatus] = useState("");
  const { data: bookingsData, isLoading: bookingsLoading } = useGetBookingsQuery(
    { category: cat, id, page: bookingPage, status: bookingStatus },
    { skip: tab !== "bookings" }
  );

  const handleToggleActive = async () => {
    if (!data?.item) return;
    const fd = new FormData();
    fd.append("isActive", String(!data.item.isActive));
    await updateDestination({ category: cat, id, data: fd });
  };

  const handleQuotaSubmit = async (values: { date: string; availableQuota: number; eventName: string }) => {
    await updateQuota({ category: cat, id, ...values });
    resetQuota();
  };

  if (isLoading) {
    return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600" /></div>;
  }

  const item = data?.item;
  if (!item) return <p className="text-gray-500">Destination not found.</p>;

  const tabCls = (t: Tab) =>
    `px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t ? "border-emerald-600 text-emerald-700" : "border-transparent text-gray-500 hover:text-gray-700"}`;

  return (
    <div className="max-w-3xl space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link href={`/admin/${cat}`} className="text-gray-400 hover:text-gray-600 text-sm">← Back</Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">{item.name}</h1>
          <p className="text-sm text-gray-500">📍 {item.location}</p>
        </div>
        <button
          onClick={handleToggleActive}
          disabled={updating}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            item.isActive ? "bg-orange-100 text-orange-700 hover:bg-orange-200" : "bg-green-100 text-green-700 hover:bg-green-200"
          }`}
        >
          {item.isActive ? "Deactivate" : "Activate"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button className={tabCls("details")} onClick={() => setTab("details")}>Details</button>
        <button className={tabCls("quota")} onClick={() => setTab("quota")}>Quota Management</button>
        <button className={tabCls("bookings")} onClick={() => setTab("bookings")}>Bookings</button>
      </div>

      {/* ── Details Tab ── */}
      {tab === "details" && (
        <div className="space-y-5">
          {/* Image Gallery */}
          {item.images.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="relative h-96 bg-gray-200">
                <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
              </div>
              {item.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2 p-3">
                  {item.images.slice(1, 5).map((img, i) => (
                    <img key={i} src={img} alt="" className="w-full h-24 object-cover rounded-lg" />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Main Info Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-5">
            {/* Price & Quota */}
            <div className="grid grid-cols-3 gap-4 pb-5 border-b border-gray-100">
              <div>
                <p className="text-xs text-gray-400 mb-1">Base Price</p>
                <p className="text-2xl font-bold text-emerald-700">
                  ETB {parseFloat(String(item.basePrice)).toLocaleString()}
                </p>
                <p className="text-xs text-gray-400">per person</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Default Daily Quota</p>
                <p className="text-2xl font-bold text-gray-900">{item.dailyQuota}</p>
                <p className="text-xs text-gray-400">visitors per day</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Total Bookings</p>
                {summary ? (
                  <>
                    <p className="text-2xl font-bold text-orange-600">{summary.totalBooked}</p>
                    <p className="text-xs text-gray-400">
                      people booked ({summary.totalUpcomingBookings} bookings)
                    </p>
                  </>
                ) : (
                  <p className="text-2xl font-bold text-gray-400">—</p>
                )}
              </div>
            </div>

            {/* Description with Rich Formatting */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-3">About</h2>
              <div className="text-gray-600 leading-relaxed text-sm space-y-3">
                {item.description.split('\n').map((paragraph, idx) => {
                  // Check if line starts with a bold heading pattern (text followed by colon)
                  const headingMatch = paragraph.match(/^([^:]+):\s*(.+)$/);
                  if (headingMatch) {
                    return (
                      <div key={idx}>
                        <h3 className="font-semibold text-gray-800 inline">{headingMatch[1]}:</h3>
                        <span className="ml-1">{headingMatch[2]}</span>
                      </div>
                    );
                  }
                  // Regular paragraph
                  return paragraph.trim() ? (
                    <p key={idx}>{paragraph}</p>
                  ) : null;
                })}
              </div>
            </div>

            {/* Video */}
            {item.videoUrl && (
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-3">Video Tour</h2>
                <video
                  src={item.videoUrl}
                  controls
                  className="w-full rounded-lg max-h-96 bg-black"
                />
              </div>
            )}

            {/* Wildlife */}
            {item.wildlife && item.wildlife.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-3">Wildlife</h2>
                <div className="flex flex-wrap gap-2">
                  {item.wildlife.map((w, i) => (
                    <span key={i} className="px-3 py-1 bg-green-50 text-green-700 text-sm rounded-full">
                      {w}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Transportation */}
            {item.transportationOptions.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-3">
                  Getting There from Addis Ababa
                </h2>
                <div className="space-y-3">
                  {item.transportationOptions.map((opt, i) => {
                    // Check if option starts with a method like "By Air:", "By Bus:", etc.
                    const methodMatch = opt.match(/^(By [^:]+):\s*(.+)$/s);
                    
                    return (
                      <div key={i} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="mt-0.5">
                          <span className="text-emerald-600 text-lg">→</span>
                        </div>
                        <div className="flex-1">
                          {methodMatch ? (
                            <>
                              <p className="font-semibold text-gray-800 text-sm mb-1">{methodMatch[1]}</p>
                              <p className="text-sm text-gray-600 leading-relaxed">{methodMatch[2]}</p>
                            </>
                          ) : (
                            <p className="text-sm text-gray-700">{opt}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Festival Info */}
            {cat === "festivals" && item.festivalType && (
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Festival Type</h2>
                <p className="text-sm text-gray-600">{item.festivalType}</p>
              </div>
            )}

            {/* Festival Dates */}
            {cat === "festivals" && item.festivalDates && item.festivalDates.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-3">Festival Dates</h2>
                <div className="space-y-2">
                  {item.festivalDates.map((fd, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {new Date(fd.date).toLocaleDateString("en-ET", { 
                            weekday: "short", 
                            year: "numeric", 
                            month: "short", 
                            day: "numeric" 
                          })}
                        </p>
                        {fd.eventName && <p className="text-xs text-gray-500">{fd.eventName}</p>}
                      </div>
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">
                        <span className="font-bold">{fd.availableQuota}</span> spots
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Creator Info */}
            {item.creator && (
              <div className="pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400">
                  Created by <span className="font-medium text-gray-600">{item.creator.fullName}</span>
                  {item.createdAt && <> on {new Date(item.createdAt).toLocaleDateString()}</>}
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Link
              href={`/admin/${cat}/${id}/edit`}
              className="flex-1 text-center px-6 py-3 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
            >
              ✏️ Edit Details
            </Link>
            <Link
              href={`/destination/${cat}/${id}`}
              target="_blank"
              className="px-6 py-3 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors"
            >
              👁️ View as User
            </Link>
          </div>
        </div>
      )}

      {/* ── Quota Tab ── */}
      {tab === "quota" && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h2 className="text-base font-semibold text-gray-800 mb-1">Set Quota for a Specific Date</h2>
            <p className="text-xs text-gray-400 mb-4">
              Override the default quota ({item.dailyQuota}) for any date without affecting others.
            </p>
            <form onSubmit={hq(handleQuotaSubmit)} className="grid grid-cols-3 gap-3 items-end">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
                <input type="date" {...rq("date", { required: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Available Quota</label>
                <input type="number" {...rq("availableQuota", { required: true, min: 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder={String(item.dailyQuota)} />
              </div>
              {cat === "festivals" && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Event Name</label>
                  <input {...rq("eventName")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g. Day 1" />
                </div>
              )}
              <button type="submit" disabled={quotaLoading}
                className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50">
                {quotaLoading ? "Saving..." : "Set Quota"}
              </button>
            </form>
          </div>

          {/* Existing overrides */}
          {(cat === "festivals" ? item.festivalDates : item.quotaOverrides)?.length ? (
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                {cat === "festivals" ? "Festival Dates" : "Quota Overrides"}
              </h3>
              <div className="space-y-2">
                {(cat === "festivals" ? item.festivalDates! : item.quotaOverrides!).map((q, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {new Date(q.date).toLocaleDateString("en-ET", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}
                      </p>
                      {q.eventName && <p className="text-xs text-gray-400">{q.eventName}</p>}
                    </div>
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-sm rounded-full">
                      <span className="font-bold">{q.availableQuota}</span> spots
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* ── Bookings Tab ── */}
      {tab === "bookings" && (
        <div className="space-y-4">
          <div className="flex gap-3">
            <select value={bookingStatus} onChange={e => { setBookingStatus(e.target.value); setBookingPage(1); }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {bookingsLoading ? (
              <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" /></div>
            ) : bookingsData?.bookings?.length === 0 ? (
              <p className="text-center text-gray-400 py-10 text-sm">No bookings found.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {["Tourist", "Email", "Date", "People", "Total", "Status"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bookingsData?.bookings?.map((b: any) => (
                    <tr key={b.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{b.user?.fullName}</td>
                      <td className="px-4 py-3 text-gray-500">{b.user?.email}</td>
                      <td className="px-4 py-3 text-gray-600">{new Date(b.bookingDate).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-gray-600">{b.numberOfPeople}</td>
                      <td className="px-4 py-3 font-medium text-emerald-700">ETB {b.totalPrice?.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          b.status === "CONFIRMED" ? "bg-green-100 text-green-700" :
                          b.status === "CANCELLED" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
                        }`}>{b.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {bookingsData && bookingsData.pages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">Page {bookingsData.page} of {bookingsData.pages}</p>
                <div className="flex gap-2">
                  <button disabled={bookingPage === 1} onClick={() => setBookingPage(p => p - 1)}
                    className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40">Prev</button>
                  <button disabled={bookingPage === bookingsData.pages} onClick={() => setBookingPage(p => p + 1)}
                    className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40">Next</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
