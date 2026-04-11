"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { logout } from "@/store/slices/authSlice";
import { useLogoutMutation } from "@/store/slices/authApiSlice";
import { LayoutGrid, Landmark, Mountain, Music, LogOut, ChevronRight } from "lucide-react";

const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutGrid },
  { href: "/admin/historical", label: "Historical Sites", icon: Landmark },
  { href: "/admin/parks", label: "National Parks", icon: Mountain },
  { href: "/admin/festivals", label: "Cultural Festivals", icon: Music },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [logoutApi] = useLogoutMutation();

  const handleLogout = async () => {
    try { await logoutApi().unwrap(); } catch {}
    dispatch(logout());
    router.replace("/login");
  };

  return (
    <aside className="w-64 bg-white flex flex-col shrink-0 border-r border-gray-100 shadow-sm">
      {/* Brand */}
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-green-700 rounded-lg flex items-center justify-center">
            <Mountain size={18} className="text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
            Ethio Tourism
          </span>
        </div>
        <p className="text-xs font-semibold text-green-600 uppercase tracking-wider">Admin Panel</p>
      </div>

      {/* User info */}
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center text-white text-sm font-bold shadow-sm">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate capitalize">{user?.role?.toLowerCase()}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-1">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-3">
          Management
        </p>
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                active
                  ? "bg-gradient-to-r from-green-50 to-green-100 text-green-700 shadow-sm"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Icon 
                size={18} 
                className={`transition-colors ${
                  active ? "text-green-600" : "text-gray-400 group-hover:text-gray-600"
                }`}
              />
              <span className="flex-1">{item.label}</span>
              {active && <ChevronRight size={16} className="text-green-600" />}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-5 border-t border-gray-100 bg-gray-50">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors group"
        >
          <LogOut size={18} className="group-hover:translate-x-0.5 transition-transform" />
          Logout
        </button>
      </div>
    </aside>
  );
}
