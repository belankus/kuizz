import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes yang butuh autentikasi
const PROTECTED_PREFIXES = ['/dashboard'];

// Routes auth (redirect ke dashboard kalau sudah login)
const AUTH_ROUTES = ['/login', '/register'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const isProtected = PROTECTED_PREFIXES.some(
        (p) => pathname === p || pathname.startsWith(p + '/')
    );
    const isAuthRoute = AUTH_ROUTES.some((p) => pathname.startsWith(p));

    // Cookie yang diset oleh backend (httpOnly refresh token)
    const hasRefreshToken = request.cookies.has('refreshToken');

    // Kalau akses halaman protected tanpa cookie → redirect login
    if (isProtected && !hasRefreshToken) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Kalau sudah login, coba akses /login atau /register → redirect dashboard
    if (isAuthRoute && hasRefreshToken) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/dashboard',
        '/dashboard/:path*',
        '/login',
        '/register',
    ],
};
