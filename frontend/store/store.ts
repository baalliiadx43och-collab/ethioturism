import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "./slices/authApiSlice";
import { superAdminApi } from "./slices/superAdminApiSlice";
import { destinationApi } from "./slices/destinationApiSlice";
import { publicDestinationApi } from "./slices/publicDestinationApiSlice";
import { bookingApi } from "./slices/bookingApiSlice";
import { userApi } from "./slices/userApiSlice";
import authReducer from "./slices/authSlice";

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [superAdminApi.reducerPath]: superAdminApi.reducer,
    [destinationApi.reducerPath]: destinationApi.reducer,
    [publicDestinationApi.reducerPath]: publicDestinationApi.reducer,
    [bookingApi.reducerPath]: bookingApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(superAdminApi.middleware)
      .concat(destinationApi.middleware)
      .concat(publicDestinationApi.middleware)
      .concat(bookingApi.middleware)
      .concat(userApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
