import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes yang butuh autentikasi
const PROTECTED_PREFIXES = ["/dashboard"];

// Routes auth (redirect ke dashboard kalau sudah login)
const AUTH_ROUTES = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Debug logs
  console.log(`[Middleware] Path: ${pathname}`);
  console.log(
    `[Middleware] Cookies:`,
    request.cookies.getAll().map((c) => c.name),
  );

  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
  const isAuthRoute = AUTH_ROUTES.some((p) => pathname.startsWith(p));

  // The JWT is kept in sessionStorage, so use a local navigation marker here.
  // API requests still validate the JWT independently.
  const isAuthenticated = request.cookies.has("kuizz_authenticated");

  // Kalau akses halaman protected tanpa cookie → redirect login
  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Kalau sudah login, coba akses /login atau /register → redirect dashboard
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*", "/login", "/register"],
};
