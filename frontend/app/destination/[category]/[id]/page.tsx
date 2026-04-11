"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useGetPublicDestinationQuery } from "@/store/slices/publicDestinationApiSlice";
import {
  useCheckAvailabilityQuery,
  useCreateBookingMutation,
} from "@/store/slices/bookingApiSlice";
import {
  MapPin, Bus, Plane, Car, Clock, Users, CalendarDays,
  Loader2, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/store/slices/publicDestinationApiSlice";
import UserLayout from "@/components/user/UserLayout";

function TransportIcon({ option }: { option: string }) {
  const lower = option.toLowerCase();
  if (lower.includes("flight") || lower.includes("air")) return <Plane size={16} className="text-green-600" />;
  if (lower.includes("bus") || lower.includes("coach")) return <Bus size={16} className="text-green-600" />;
  return <Car size={16} className="text-green-600" />;
}

function toDateInput(d: Date) {
  return d.toISOString().split("T")[0];
}

export default function DestinationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const category = params.category as Category;
  const id = params.id as string;

  const { data, isLoading, isError } = useGetPublicDestinationQuery({ category, id });
  const destination = data?.item;

  const [imgIndex, setImgIndex] = useState(0);
  const today = toDateInput(new Date());
  const [bookingDate, setBookingDate] = useState(today);
  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState("");

  const { data: availability, isFetching: checkingAvail } = useCheckAvailabilityQuery(
    { category, destinationId: id, date: bookingDate },
    { skip: !bookingDate || !id }
  );

  const [createBooking, { isLoading: booking }] = useCreateBookingMutation();

  const handleBook = async () => {
    if (!isAuthenticated) { router.push("/login"); return; }
    setBookingError("");
    try {
      await createBooking({ category, destinationId: id, bookingDate, numberOfPeople }).unwrap();
      setBookingSuccess(true);
    } catch (err: any) {
      setBookingError(err?.data?.message || "Booking failed. Please try again.");
    }
  };

  // Loading / error states still use UserLayout so sidebar stays visible
  if (isLoading) {
    return (
      <UserLayout>
        <div className="flex items-center justify-center py-32">
          <Loader2 size={36} className="animate-spin text-green-600" />
        </div>
      </UserLayout>
    );
  }

  if (isError || !destination) {
    return (
      <UserLayout>
        <div className="flex flex-col items-center justify-center py-32 gap-4 text-gray-500">
          <AlertCircle size={40} />
          <p className="text-lg font-medium">Destination not found</p>
          <Link href="/dashboard" className="text-green-600 hover:underline text-sm">
            Back to Explore
          </Link>
        </div>
      </UserLayout>
    );
  }

  const images = destination.images?.length ? destination.images : [];
  const canBook =
    !checkingAvail &&
    availability?.available &&
    (availability?.remaining ?? 0) >= numberOfPeople;

  return (
    <UserLayout>
      <div className="flex flex-col lg:flex-row gap-8">
        {/* ── Left: Details ── */}
        <div className="flex-1 min-w-0">
          {/* Image Gallery */}
          <div className="relative rounded-2xl overflow-hidden bg-gray-200 h-72 sm:h-96">
            {images.length > 0 ? (
              <>
                <Image
                  src={images[imgIndex]}
                  alt={destination.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  priority
                />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setImgIndex((i) => (i - 1 + images.length) % images.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow"
                      aria-label="Previous image"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      onClick={() => setImgIndex((i) => (i + 1) % images.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow"
                      aria-label="Next image"
                    >
                      <ChevronRight size={18} />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {images.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setImgIndex(i)}
                          className={`w-2 h-2 rounded-full transition-colors ${i === imgIndex ? "bg-white" : "bg-white/50"}`}
                          aria-label={`Image ${i + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">
                No images available
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setImgIndex(i)}
                  className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                    i === imgIndex ? "border-green-500" : "border-transparent"
                  }`}
                >
                  <Image src={img} alt="" fill className="object-cover" sizes="64px" />
                </button>
              ))}
            </div>
          )}

          {/* Title & price */}
          <div className="mt-5 flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{destination.name}</h1>
              <div className="flex items-center gap-1.5 mt-1 text-gray-500 text-sm">
                <MapPin size={14} />
                <span>{destination.location}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Starting from</p>
              <p className="text-2xl font-bold text-green-700">
                {destination.basePrice.toLocaleString()} ETB
              </p>
              <p className="text-xs text-gray-400">per person</p>
            </div>
          </div>

          {/* Description */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">About</h2>
            <p className="text-gray-600 leading-relaxed text-sm">{destination.description}</p>
          </div>

          {/* Wildlife */}
          {destination.wildlife && destination.wildlife.length > 0 && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Wildlife</h2>
              <div className="flex flex-wrap gap-2">
                {destination.wildlife.map((w) => (
                  <span key={w} className="px-3 py-1 bg-green-50 text-green-700 text-sm rounded-full">
                    {w}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Transport */}
          {destination.transportationOptions?.length > 0 && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">
                Getting There from Addis Ababa
              </h2>
              <div className="space-y-3">
                {destination.transportationOptions.map((opt, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <div className="mt-0.5"><TransportIcon option={opt} /></div>
                    <p className="flex-1 text-sm text-gray-700">{opt}</p>
                    <Clock size={14} className="text-gray-300 mt-0.5 flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Sticky Booking Card ── */}
        <div className="lg:w-80 xl:w-96 flex-shrink-0">
          <div className="sticky top-20">
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5">
              {bookingSuccess ? (
                <div className="text-center py-6">
                  <CheckCircle2 size={48} className="text-green-500 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-900">Booking Confirmed!</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Your trip to {destination.name} is booked.
                  </p>
                  <div className="mt-4 space-y-2">
                    <Link
                      href="/bookings"
                      className="block w-full text-center py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-colors"
                    >
                      View My Bookings
                    </Link>
                    <button
                      onClick={() => setBookingSuccess(false)}
                      className="block w-full text-center py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                      Book Again
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="text-base font-semibold text-gray-900 mb-4">Book Your Visit</h3>

                  {/* Date */}
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">
                      <CalendarDays size={13} className="inline mr-1" />
                      Select Date
                    </label>
                    <input
                      type="date"
                      min={today}
                      value={bookingDate}
                      onChange={(e) => { setBookingDate(e.target.value); setBookingError(""); }}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  {/* People */}
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">
                      <Users size={13} className="inline mr-1" />
                      Number of People
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setNumberOfPeople((n) => Math.max(1, n - 1))}
                        className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-lg font-medium hover:bg-gray-50"
                      >−</button>
                      <span className="flex-1 text-center font-semibold text-gray-900 text-lg">
                        {numberOfPeople}
                      </span>
                      <button
                        onClick={() => setNumberOfPeople((n) => Math.min(n + 1, availability?.remaining ?? 99))}
                        className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-lg font-medium hover:bg-gray-50"
                      >+</button>
                    </div>
                  </div>

                  {/* Availability */}
                  {bookingDate && (
                    <div className="mb-4">
                      {checkingAvail ? (
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Loader2 size={13} className="animate-spin" />
                          Checking availability...
                        </div>
                      ) : availability ? (
                        <div className={`flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg ${
                          availability.available ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
                        }`}>
                          {availability.available
                            ? <><CheckCircle2 size={13} /> {availability.remaining} spot{availability.remaining !== 1 ? "s" : ""} available</>
                            : <><AlertCircle size={13} /> Fully booked for this date</>
                          }
                        </div>
                      ) : null}
                    </div>
                  )}

                  {/* Price summary */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-xl">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{destination.basePrice.toLocaleString()} ETB × {numberOfPeople}</span>
                      <span className="font-semibold text-gray-900">
                        {(destination.basePrice * numberOfPeople).toLocaleString()} ETB
                      </span>
                    </div>
                  </div>

                  {/* Error */}
                  {bookingError && (
                    <div className="mb-3 flex items-start gap-2 text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                      <AlertCircle size={13} className="mt-0.5 flex-shrink-0" />
                      {bookingError}
                    </div>
                  )}

                  {/* Book button */}
                  <button
                    onClick={handleBook}
                    disabled={booking || (!isAuthenticated ? false : !canBook)}
                    className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    {booking ? (
                      <><Loader2 size={16} className="animate-spin" /> Booking...</>
                    ) : !isAuthenticated ? "Login to Book" : "Book Now"}
                  </button>

                  {!isAuthenticated && (
                    <p className="text-xs text-center text-gray-400 mt-2">
                      <Link href="/login" className="text-green-600 hover:underline">Log in</Link> to make a booking
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
