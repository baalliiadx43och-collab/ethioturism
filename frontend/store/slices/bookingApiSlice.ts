import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store";

const baseUrl =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export interface Booking {
  id: number;
  destinationName: string;
  destinationType: string;
  destinationId: number;
  bookingDate: string;
  numberOfPeople: number;
  totalPrice: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  notes: string;
  createdAt: string;
}

export interface AvailabilityResult {
  success: boolean;
  quota: number;
  alreadyBooked: number;
  remaining: number;
  available: boolean;
}

export interface DestinationSummary {
  success: boolean;
  quota: number;
  bookedToday: number;
  remainingToday: number;
  totalBooked: number;
  totalUpcomingBookings: number;
}

export interface CreateBookingRequest {
  category: string;
  destinationId: string | number;
  bookingDate: string;
  numberOfPeople: number;
  notes?: string;
}

export const bookingApi = createApi({
  reducerPath: "bookingApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseUrl}/bookings`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set("authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Bookings"],
  endpoints: (builder) => ({
    checkAvailability: builder.query<
      AvailabilityResult,
      { category: string; destinationId: string | number; date: string }
    >({
      query: ({ category, destinationId, date }) =>
        `/availability?category=${category}&destinationId=${destinationId}&date=${date}`,
    }),
    getDestinationSummary: builder.query<
      DestinationSummary,
      { category: string; destinationId: string | number }
    >({
      query: ({ category, destinationId }) =>
        `/summary/${category}/${destinationId}`,
      providesTags: ["Bookings"],
    }),
    createBooking: builder.mutation<
      { success: boolean; booking: Booking },
      CreateBookingRequest
    >({
      query: (body) => ({ url: "/", method: "POST", body }),
      invalidatesTags: ["Bookings"],
    }),
    getMyBookings: builder.query<
      { success: boolean; count: number; bookings: Booking[] },
      void
    >({
      query: () => "/my",
      providesTags: ["Bookings"],
    }),
    cancelBooking: builder.mutation<
      { success: boolean; booking: Booking },
      number
    >({
      query: (id) => ({ url: `/${id}/cancel`, method: "PATCH" }),
      invalidatesTags: ["Bookings"],
    }),
  }),
});

export const {
  useCheckAvailabilityQuery,
  useGetDestinationSummaryQuery,
  useCreateBookingMutation,
  useGetMyBookingsQuery,
  useCancelBookingMutation,
} = bookingApi;
