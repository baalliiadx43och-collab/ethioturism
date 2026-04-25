import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store";

const baseUrl =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export type Category = "historical" | "parks" | "festivals";

export interface QuotaDate {
  date: string;
  availableQuota: number;
  eventName?: string;
}

export interface Destination {
  id: number;
  name: string;
  location: string;
  description: string;
  images: string[];
  videoUrl: string;
  basePrice: number;
  dailyQuota: number;
  quotaOverrides?: QuotaDate[];
  festivalDates?: QuotaDate[];
  transportationOptions: string[];
  wildlife?: string[];
  festivalType?: string;
  isActive: boolean;
  creator?: { fullName: string };
  createdAt: string;
}

export interface PaginatedDestinations {
  success: boolean;
  total: number;
  page: number;
  pages: number;
  items: Destination[];
}

export const destinationApi = createApi({
  reducerPath: "destinationApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseUrl}/destinations`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set("authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Destinations"],
  endpoints: (builder) => ({
    getDestinations: builder.query<
      PaginatedDestinations,
      { category: Category; search?: string; page?: number }
    >({
      query: ({ category, search = "", page = 1 }) =>
        `/${category}?search=${search}&page=${page}&limit=12`,
      providesTags: ["Destinations"],
    }),
    getDestination: builder.query<
      { success: boolean; item: Destination },
      { category: Category; id: string }
    >({
      query: ({ category, id }) => `/${category}/${id}`,
      providesTags: ["Destinations"],
    }),
    createDestination: builder.mutation<
      { success: boolean; item: Destination },
      { category: Category; data: FormData }
    >({
      query: ({ category, data }) => ({
        url: `/${category}`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Destinations"],
    }),
    updateDestination: builder.mutation<
      { success: boolean; item: Destination },
      { category: Category; id: string | number; data: FormData | Partial<Destination> }
    >({
      query: ({ category, id, data }) => ({
        url: `/${category}/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Destinations"],
    }),
    deleteDestination: builder.mutation<
      { success: boolean },
      { category: Category; id: string | number }
    >({
      query: ({ category, id }) => ({ url: `/${category}/${id}`, method: "DELETE" }),
      invalidatesTags: ["Destinations"],
    }),
    updateQuota: builder.mutation<
      { success: boolean; item: Destination },
      { category: Category; id: string | number; date: string; availableQuota: number; eventName?: string }
    >({
      query: ({ category, id, ...body }) => ({
        url: `/${category}/${id}/quota`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Destinations"],
    }),
    getBookings: builder.query<
      any,
      { category: Category; id: string | number; page?: number; status?: string; date?: string }
    >({
      query: ({ category, id, page = 1, status = "", date = "" }) =>
        `/${category}/${id}/bookings?page=${page}&status=${status}&date=${date}`,
    }),
    uploadMedia: builder.mutation<
      { success: boolean; files: { url: string; type: string }[] },
      FormData
    >({
      query: (data) => ({ url: "/upload", method: "POST", body: data }),
    }),
  }),
});

export const {
  useGetDestinationsQuery,
  useGetDestinationQuery,
  useCreateDestinationMutation,
  useUpdateDestinationMutation,
  useDeleteDestinationMutation,
  useUpdateQuotaMutation,
  useGetBookingsQuery,
  useUploadMediaMutation,
} = destinationApi;
