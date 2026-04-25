"use client";

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { useRouter, usePathname } from "next/navigation";
import { useLogoutMutation } from "@/store/slices/authApiSlice";
import { logout, setCredentials } from "@/store/slices/authSlice";
import { useGetMyBookingsQuery } from "@/store/slices/bookingApiSlice";
import { useGetProfileQuery } from "@/store/slices/userApiSlice";
import {
  Search, Mountain, Landmark, Music, LayoutGrid,
  MapPin, CalendarDays, Menu, Settings, LogOut, User,
  X, Bell, ChevronRight,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import AIAssistant from "@/components/shared/AIAssistant";

const CATEGORY_LINKS = [
  { label: "All Destinations", value: "", icon: <LayoutGrid size={17} /> },
  { label: "Historical Sites", value: "historical", icon: <Landmark size={17} /> },
  { label: "National Parks", value: "parks", icon: <Mountain size={17} /> },
  { label: "Cultural Festivals", value: "festivals", icon: <Music size={17} /> },
];

interface Props {
  children: React.ReactNode;
  search?: string;
  onSearchChange?: (v: string) => void;
  activeCategory?: string;
  onCategoryChange?: (v: string) => void;
}

export default function UserLayout({
  children,
  search = "",
  onSearchChange,
  activeCategory = "",
  onCategoryChange,
}: Props) {
  const { user, isAuthenticated, token } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const [logoutApi, { isLoading: loggingOut }] = useLogoutMutation();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: bookingsData } = useGetMyBookingsQuery(undefined, {
    skip: !mounted || !isAuthenticated,
  });

  // Fetch profile to sync profile image with auth state
  const { data: profileData } = useGetProfileQuery(undefined, {
    skip: !mounted || !isAuthenticated,
  });

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (mounted && !isAuthenticated) router.replace("/login");
  }, [mounted, isAuthenticated, router]);

  // Sync profile image from profile data to auth state
  useEffect(() => {
    if (profileData?.user && user && token) {
      // Only update if profile image is different
      if (profileData.user.profileImage !== user.profileImage) {
        dispatch(setCredentials({
          user: {
            ...user,
            profileImage: profileData.user.profileImage,
          },
          token,
        }));
      }
    }
  }, [profileData, user, token, dispatch]);

  if (!mounted || !isAuthenticated || !user) return null;

  const handleLogout = async () => {
    try { await logoutApi().unwrap(); } catch {}
    dispatch(logout());
    window.location.href = "/login";
  };

  const isDashboard = pathname === "/dashboard";
  const isBookings = pathname === "/bookings";
  const isSettings = pathname === "/settings";
  const isDestination = pathname.startsWith("/destination");

  const upcomingBookings = bookingsData?.bookings?.filter(
    b => b.status !== "CANCELLED" && new Date(b.bookingDate) >= new Date()
  ).length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {/* Top Nav */}
      <nav className="bg-white shadow-sm sticky top-0 z-30 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setSidebarOpen((v) => !v)}
              aria-label="Toggle sidebar"
            >
              <Menu size={20} />
            </button>
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-green-700 rounded-lg flex items-center justify-center">
                <Mountain size={18} className="text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent whitespace-nowrap">
                Ethio Tourism
              </span>
            </Link>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-md relative">
            <Search
              size={16}
              className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${
                isDashboard ? "text-gray-400" : "text-gray-300"
              }`}
            />
            <input
              type="text"
              placeholder="Search destinations..."
              value={search}
              onChange={(e) => onSearchChange?.(e.target.value)}
              disabled={!isDashboard}
              aria-label="Search destinations"
              className={`w-full pl-9 pr-4 py-2 text-sm border rounded-xl focus:outline-none transition-all ${
                isDashboard
                  ? "border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-800 bg-gray-50"
                  : "border-gray-100 text-gray-300 cursor-not-allowed select-none bg-gray-50"
              }`}
            />
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Notifications */}
            <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <Bell size={20} className="text-gray-600" />
              {upcomingBookings > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>

            {/* User profile */}
            <Link
              href="/settings"
              className="flex items-center gap-2 shrink-0 hover:bg-gray-50 rounded-xl p-1.5 pr-3 transition-colors group"
            >
              <div className="relative w-9 h-9 rounded-full bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center text-white text-sm font-semibold overflow-hidden ring-2 ring-gray-100 group-hover:ring-green-200 transition-all">
                {user.profileImage ? (
                  <Image src={user.profileImage} alt={user.name} fill className="object-cover" />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
              <span className="hidden sm:block text-sm text-gray-700 font-medium truncate max-w-[100px]">
                {user.name.split(" ")[0]}
              </span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="flex flex-1 max-w-7xl mx-auto w-full px-4 py-6 gap-6">
        {/* Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            fixed top-16 left-0 bottom-0 z-40 w-64 bg-white shadow-2xl overflow-y-auto
            transform transition-transform duration-300 flex flex-col
            md:sticky md:top-6 md:h-[calc(100vh-7.5rem)] md:shadow-none md:w-56 md:translate-x-0 md:flex-shrink-0 md:rounded-2xl md:border md:border-gray-100
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          {/* Mobile close button */}
          <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-100">
            <span className="font-semibold text-gray-900">Menu</span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-5 flex-1">
            {/* Explore Categories */}
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              Explore
            </p>
            <nav className="space-y-1">
              {CATEGORY_LINKS.map((cat) => {
                const isActive = isDashboard && activeCategory === cat.value;
                return (
                  <button
                    key={cat.value}
                    onClick={() => {
                      onCategoryChange?.(cat.value);
                      if (!isDashboard) router.push("/dashboard");
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left group ${
                      isActive
                        ? "bg-gradient-to-r from-green-50 to-green-100 text-green-700 shadow-sm"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <span className={`transition-colors ${isActive ? "text-green-600" : "text-gray-400 group-hover:text-gray-600"}`}>
                      {cat.icon}
                    </span>
                    <span className="flex-1">{cat.label}</span>
                    {isActive && <ChevronRight size={16} className="text-green-600" />}
                  </button>
                );
              })}
            </nav>

            {/* My Account */}
            <div className="mt-6 pt-5 border-t border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                My Account
              </p>
              <div className="space-y-1">
                <Link
                  href="/bookings"
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                    isBookings
                      ? "bg-gradient-to-r from-green-50 to-green-100 text-green-700 shadow-sm"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <CalendarDays
                    size={17}
                    className={`transition-colors ${isBookings ? "text-green-600" : "text-gray-400 group-hover:text-gray-600"}`}
                  />
                  <span className="flex-1">My Bookings</span>
                  {upcomingBookings > 0 && (
                    <span className="px-2 py-0.5 bg-green-600 text-white text-xs font-bold rounded-full">
                      {upcomingBookings}
                    </span>
                  )}
                  {isBookings && <ChevronRight size={16} className="text-green-600" />}
                </Link>

                <Link
                  href="/settings"
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                    isSettings
                      ? "bg-gradient-to-r from-green-50 to-green-100 text-green-700 shadow-sm"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Settings
                    size={17}
                    className={`transition-colors ${isSettings ? "text-green-600" : "text-gray-400 group-hover:text-gray-600"}`}
                  />
                  <span className="flex-1">Settings</span>
                  {isSettings && <ChevronRight size={16} className="text-green-600" />}
                </Link>

                {(isDestination || isBookings || isSettings) && (
                  <Link
                    href="/dashboard"
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all group"
                  >
                    <MapPin size={17} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                    <span className="flex-1">Back to Explore</span>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Logout */}
          <div className="p-5 border-t border-gray-100 bg-gray-50">
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 group"
            >
              <LogOut size={17} className="group-hover:translate-x-0.5 transition-transform" />
              {loggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        </aside>

        {/* Page content */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>

      {/* AI Assistant */}
      <AIAssistant />
    </div>
  );
}
