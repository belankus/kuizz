import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJWT, type AuthUser } from "./lib/auth";

// Routes yang butuh autentikasi
const PROTECTED_PREFIXES = ["/dashboard"];

// Routes auth (redirect ke dashboard kalau sudah login)
const AUTH_ROUTES = ["/login", "/register"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
  const isAuthRoute = AUTH_ROUTES.some((p) => pathname.startsWith(p));

  // Cookie yang diset oleh backend
  const refreshToken = request.cookies.get("refreshToken")?.value;
  const accessToken = request.cookies.get("accessToken")?.value;

  let user: AuthUser | null = null;
  let isRefreshValid = false;

  // 1. Verifikasi Access Token
  if (accessToken) {
    user = await verifyJWT(accessToken, "access");
  }

  // 2. Verifikasi Refresh Token (hanya jika access token tidak valid atau di auth route)
  if (!user && refreshToken) {
    const refreshPayload = await verifyJWT(refreshToken, "refresh");
    isRefreshValid = !!refreshPayload;
  }

  // 3. Logika untuk Protected Routes
  if (isProtected) {
    if (!user && !isRefreshValid) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);

      const response = NextResponse.redirect(loginUrl);
      if (accessToken) response.cookies.delete("accessToken");
      if (refreshToken) response.cookies.delete("refreshToken");

      return response;
    }
  }

  // 4. Logika untuk Auth Routes (/login, /register)
  if (isAuthRoute) {
    if (user || isRefreshValid) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // 5. Optimization: Inject user info into headers for downstream components
  const requestHeaders = new Headers(request.headers);
  if (user) {
    requestHeaders.set("x-user-id", user.id);
    requestHeaders.set("x-user-email", user.email);
    requestHeaders.set("x-user-role", user.role);
    if (user.name) requestHeaders.set("x-user-name", user.name);
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*", "/login", "/register"],
};
