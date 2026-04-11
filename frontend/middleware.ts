import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ROLE_HOME: Record<string, string> = {
  SUPER_ADMIN: "/super-admin",
  ADMIN: "/admin",
  USER: "/dashboard",
};

const protectedRoutes = ["/dashboard", "/super-admin", "/admin", "/bookings", "/settings"];
const authRoutes = ["/login", "/signup"];

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const role = request.cookies.get("role")?.value;
  const { pathname } = request.nextUrl;

  const isProtected = protectedRoutes.some((r) => pathname.startsWith(r));
  const isAuthRoute = authRoutes.some((r) => pathname.startsWith(r));

  // Not logged in trying to access protected route → login
  if (isProtected && !token) {
    const url = new URL("/login", request.url);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  // Logged in trying to access auth pages → redirect to role home (unless explicitly logging out)
  if (isAuthRoute && token) {
    // Allow access to login/signup if ?force=true is present (for explicit re-login)
    const forceAuth = request.nextUrl.searchParams.get("force");
    if (!forceAuth) {
      const home = (role && ROLE_HOME[role]) || "/dashboard";
      return NextResponse.redirect(new URL(home, request.url));
    }
  }

  // Logged in but accessing wrong role's area → redirect to their home
  if (token && role) {
    const home = ROLE_HOME[role] || "/dashboard";
    if (pathname.startsWith("/super-admin") && role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL(home, request.url));
    }
    if (pathname.startsWith("/admin") && role !== "ADMIN" && role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL(home, request.url));
    }
    if (
      (pathname.startsWith("/dashboard") || pathname.startsWith("/bookings")) &&
      role !== "USER"
    ) {
      return NextResponse.redirect(new URL(home, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/super-admin/:path*",
    "/admin/:path*",
    "/bookings/:path*",
    "/settings/:path*",
    "/login",
    "/signup",
  ],
};
