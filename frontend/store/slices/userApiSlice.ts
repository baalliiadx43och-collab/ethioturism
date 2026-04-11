import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store";

const baseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  profileImage: string;
  role: string;
  status: string;
}

export interface UpdateProfileRequest {
  fullName?: string;
  phone?: string;
}

export interface UpdateEmailRequest {
  email: string;
  password: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseUrl}/users`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set("authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["UserProfile"],
  endpoints: (builder) => ({
    getProfile: builder.query<{ success: boolean; user: UserProfile }, void>({
      query: () => "/profile",
      providesTags: ["UserProfile"],
    }),
    updateProfile: builder.mutation<
      { success: boolean; message: string; user: UserProfile },
      UpdateProfileRequest
    >({
      query: (body) => ({ url: "/profile", method: "PATCH", body }),
      invalidatesTags: ["UserProfile"],
    }),
    updateProfileImage: builder.mutation<
      { success: boolean; message: string; profileImage: string },
      { profileImage: string }
    >({
      query: (body) => ({ url: "/profile/image", method: "PATCH", body }),
      invalidatesTags: ["UserProfile"],
    }),
    updateEmail: builder.mutation<
      { success: boolean; message: string; email: string },
      UpdateEmailRequest
    >({
      query: (body) => ({ url: "/profile/email", method: "PATCH", body }),
      invalidatesTags: ["UserProfile"],
    }),
    changePassword: builder.mutation<
      { success: boolean; message: string },
      ChangePasswordRequest
    >({
      query: (body) => ({ url: "/profile/password", method: "PATCH", body }),
    }),
    uploadProfileImage: builder.mutation<
      { success: boolean; url: string },
      FormData
    >({
      query: (body) => ({ url: "/profile/upload", method: "POST", body }),
    }),
  }),
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUpdateProfileImageMutation,
  useUpdateEmailMutation,
  useChangePasswordMutation,
  useUploadProfileImageMutation,
} = userApi;
