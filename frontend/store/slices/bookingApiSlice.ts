import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store";

const baseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

export interface Booking {
  _id: string;
  destinationName: string;
  destinationType: string;
  destinationId: string;
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

export interface CreateBookingRequest {
  category: string;
  destinationId: string;
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
      { category: string; destinationId: string; date: string }
    >({
      query: ({ category, destinationId, date }) =>
        `/availability?category=${category}&destinationId=${destinationId}&date=${date}`,
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
      string
    >({
      query: (id) => ({ url: `/${id}/cancel`, method: "PATCH" }),
      invalidatesTags: ["Bookings"],
    }),
  }),
});

export const {
  useCheckAvailabilityQuery,
  useCreateBookingMutation,
  useGetMyBookingsQuery,
  useCancelBookingMutation,
} = bookingApi;
