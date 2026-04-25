import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export type Category = "historical" | "parks" | "festivals";

export interface PublicDestination {
  id: number;
  name: string;
  location: string;
  description: string;
  images: string[];
  videoUrl: string;
  basePrice: number;
  dailyQuota: number;
  transportationOptions: string[];
  wildlife?: string[];
  festivalType?: string;
  isActive: boolean;
  category: Category;
  createdAt: string;
}

export interface PaginatedPublicDestinations {
  success: boolean;
  total: number;
  page: number;
  pages: number;
  items: PublicDestination[];
}

export const publicDestinationApi = createApi({
  reducerPath: "publicDestinationApi",
  baseQuery: fetchBaseQuery({ baseUrl: `${baseUrl}/public` }),
  tagTypes: ["PublicDestinations"],
  endpoints: (builder) => ({
    getPublicDestinations: builder.query<
      PaginatedPublicDestinations,
      { category?: Category; search?: string; page?: number }
    >({
      query: ({ category = "", search = "", page = 1 }) =>
        `/destinations?category=${category}&search=${search}&page=${page}&limit=12`,
      providesTags: ["PublicDestinations"],
    }),
    getPublicDestination: builder.query<
      { success: boolean; item: PublicDestination },
      { category: Category; id: string }
    >({
      query: ({ category, id }) => `/destinations/${category}/${id}`,
      providesTags: ["PublicDestinations"],
    }),
  }),
});

export const { useGetPublicDestinationsQuery, useGetPublicDestinationQuery } =
  publicDestinationApi;
