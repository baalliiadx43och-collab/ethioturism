import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "./slices/authApiSlice";
import { superAdminApi } from "./slices/superAdminApiSlice";
import { destinationApi } from "./slices/destinationApiSlice";
import authReducer from "./slices/authSlice";

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [superAdminApi.reducerPath]: superAdminApi.reducer,
    [destinationApi.reducerPath]: destinationApi.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(superAdminApi.middleware)
      .concat(destinationApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
