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

type Tab = "details" | "quota" | "bookings";

export default function DestinationDetailPage() {
  const { category, id } = useParams<{ category: string; id: string }>();
  const cat = category as Category;
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("details");

  const { data, isLoading } = useGetDestinationQuery({ category: cat, id });
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
        <div className="bg-white rounded-xl shadow-sm p-5 space-y-4">
          {/* Images */}
          {item.images.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {item.images.map((img, i) => (
                <img key={i} src={img} alt="" className="w-full h-28 object-cover rounded-lg" />
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400 text-xs">Base Price</p>
              <p className="font-semibold text-emerald-700">ETB {item.basePrice.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Default Daily Quota</p>
              <p className="font-semibold">{item.dailyQuota} visitors</p>
            </div>
          </div>

          <div>
            <p className="text-gray-400 text-xs mb-1">Description</p>
            <p className="text-sm text-gray-700">{item.description}</p>
          </div>

          {item.videoUrl && (
            <div>
              <p className="text-gray-400 text-xs mb-2">Video</p>
              <video
                src={item.videoUrl}
                controls
                className="w-full rounded-lg max-h-72 bg-black"
              />
            </div>
          )}

          {item.transportationOptions.length > 0 && (
            <div>
              <p className="text-gray-400 text-xs mb-1">Transportation from Addis Ababa</p>
              <ul className="space-y-1">
                {item.transportationOptions.map((t, i) => (
                  <li key={i} className="text-sm text-gray-700 flex items-center gap-2"><span className="text-emerald-500">→</span>{t}</li>
                ))}
              </ul>
            </div>
          )}

          {item.wildlife && item.wildlife.length > 0 && (
            <div>
              <p className="text-gray-400 text-xs mb-1">Wildlife</p>
              <div className="flex flex-wrap gap-2">
                {item.wildlife.map((w, i) => (
                  <span key={i} className="px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-full">{w}</span>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2">
            <Link
              href={`/admin/${cat}/${id}/edit`}
              className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Edit Details
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
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-sm font-semibold rounded-full">
                      {q.availableQuota} spots
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
                    <tr key={b._id} className="hover:bg-gray-50">
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
