import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store";

const baseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

export interface AdminUser {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  status: "ACTIVE" | "BLOCKED";
  createdAt: string;
}

export interface ActivityLog {
  _id: string;
  adminName: string;
  action: string;
  targetType: string;
  targetName: string;
  details: string;
  createdAt: string;
}

export interface SystemOverview {
  users: { total: number; active: number; blocked: number; newToday: number };
  admins: { total: number; active: number };
  activityBreakdown: { _id: string; count: number }[];
  recentActivity: ActivityLog[];
}

export interface PaginatedAdmins {
  success: boolean;
  total: number;
  page: number;
  pages: number;
  admins: AdminUser[];
}

export interface PaginatedUsers {
  success: boolean;
  total: number;
  page: number;
  pages: number;
  users: AdminUser[];
}

export interface PaginatedLogs {
  success: boolean;
  total: number;
  page: number;
  pages: number;
  logs: ActivityLog[];
}

export const superAdminApi = createApi({
  reducerPath: "superAdminApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseUrl}/super-admin`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set("authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Admins", "Users", "Logs", "Overview"],
  endpoints: (builder) => ({
    getOverview: builder.query<{ success: boolean; overview: SystemOverview }, void>({
      query: () => "/overview",
      providesTags: ["Overview"],
    }),
    getAdmins: builder.query<PaginatedAdmins, { search?: string; status?: string; page?: number }>({
      query: ({ search = "", status = "", page = 1 }) =>
        `/admins?search=${search}&status=${status}&page=${page}&limit=10`,
      providesTags: ["Admins"],
    }),
    createAdmin: builder.mutation<{ success: boolean; admin: AdminUser }, Partial<AdminUser> & { password: string }>({
      query: (body) => ({ url: "/admins", method: "POST", body }),
      invalidatesTags: ["Admins", "Overview"],
    }),
    updateAdmin: builder.mutation<{ success: boolean; admin: AdminUser }, { id: string; data: Partial<AdminUser> }>({
      query: ({ id, data }) => ({ url: `/admins/${id}`, method: "PATCH", body: data }),
      invalidatesTags: ["Admins"],
    }),
    updateAdminStatus: builder.mutation<{ success: boolean }, { id: string; status: "ACTIVE" | "BLOCKED" }>({
      query: ({ id, status }) => ({ url: `/admins/${id}/status`, method: "PATCH", body: { status } }),
      invalidatesTags: ["Admins", "Overview"],
    }),
    deleteAdmin: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `/admins/${id}`, method: "DELETE" }),
      invalidatesTags: ["Admins", "Overview"],
    }),
    getUsers: builder.query<PaginatedUsers, { search?: string; status?: string; page?: number }>({
      query: ({ search = "", status = "", page = 1 }) =>
        `/users?search=${search}&status=${status}&page=${page}&limit=10`,
      providesTags: ["Users"],
    }),
    updateUserStatus: builder.mutation<{ success: boolean }, { id: string; status: "ACTIVE" | "BLOCKED" }>({
      query: ({ id, status }) => ({ url: `/users/${id}/status`, method: "PATCH", body: { status } }),
      invalidatesTags: ["Users", "Overview"],
    }),
    resetUserPassword: builder.mutation<{ success: boolean }, { id: string; newPassword: string }>({
      query: ({ id, newPassword }) => ({
        url: `/users/${id}/reset-password`,
        method: "PATCH",
        body: { newPassword },
      }),
    }),
    getActivityLogs: builder.query<PaginatedLogs, { page?: number; targetType?: string }>({
      query: ({ page = 1, targetType = "" }) =>
        `/activity-logs?page=${page}&limit=20&targetType=${targetType}`,
      providesTags: ["Logs"],
    }),
  }),
});

export const {
  useGetOverviewQuery,
  useGetAdminsQuery,
  useCreateAdminMutation,
  useUpdateAdminMutation,
  useUpdateAdminStatusMutation,
  useDeleteAdminMutation,
  useGetUsersQuery,
  useUpdateUserStatusMutation,
  useResetUserPasswordMutation,
  useGetActivityLogsQuery,
} = superAdminApi;
