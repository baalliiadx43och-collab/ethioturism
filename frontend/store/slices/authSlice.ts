import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  profileImage?: string;
  token?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    rehydrate: (state) => {
      // Called once on client mount — safe to access localStorage here
      try {
        const token = localStorage.getItem("token");
        const refreshToken = localStorage.getItem("refreshToken");
        const user = localStorage.getItem("user");
        if (token && user) {
          state.token = token;
          state.refreshToken = refreshToken;
          state.user = JSON.parse(user);
          state.isAuthenticated = true;
        }
      } catch {}
    },
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string; refreshToken?: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken ?? null;
      state.isAuthenticated = true;
      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("user", JSON.stringify(action.payload.user));
      if (action.payload.refreshToken) {
        localStorage.setItem("refreshToken", action.payload.refreshToken);
      }
      const maxAge = 7 * 24 * 60 * 60;
      document.cookie = `token=${action.payload.token}; path=/; max-age=${maxAge}; SameSite=Lax`;
      // Store role in cookie so middleware can do role-based redirects
      document.cookie = `role=${action.payload.user.role}; path=/; max-age=${maxAge}; SameSite=Lax`;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      document.cookie = "token=; path=/; max-age=0; SameSite=Lax";
      document.cookie = "role=; path=/; max-age=0; SameSite=Lax";
    },
    updateToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      localStorage.setItem("token", action.payload);
    },
  },
});

export const { rehydrate, setCredentials, logout, updateToken } = authSlice.actions;
export default authSlice.reducer;
