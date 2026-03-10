import { UserModelType } from "../types";
import { jwtVerify } from "jose";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const ACCESS_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "kuizz_jwt_secret_super_secure_32chars_min",
);

const REFRESH_SECRET = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET || "kuizz_refresh_secret_super_secure_32chars",
);

export type AuthUser = UserModelType;

// ─── Token Verification (Edge compatible) ───────────────────────────────────

export async function verifyJWT(token: string, type: "access" | "refresh") {
  try {
    const secret = type === "access" ? ACCESS_SECRET : REFRESH_SECRET;
    const { payload } = await jwtVerify(token, secret);
    return {
      id: payload.sub as string,
      email: payload.email as string,
      role: payload.role as string,
      name: (payload.name as string) || null,
    } as AuthUser;
  } catch (err) {
    console.error(err);
    return null;
  }
}

/**
 * Mendapatkan user dari headers atau cookies (untuk Server Components / Actions)
 * Hanya berjalan di server.
 */
export async function getServerUser(): Promise<AuthUser | null> {
  if (typeof window !== "undefined") return null;

  try {
    // Import dinamis agar tidak pecah di client build
    const { cookies, headers } = await import("next/headers");
    const headerStore = await headers();

    // 1. Cek header (optimasi middleware)
    const userId = headerStore.get("x-user-id");
    if (userId) {
      return {
        id: userId,
        email: headerStore.get("x-user-email") || "",
        role: headerStore.get("x-user-role") || "",
        name: headerStore.get("x-user-name") || null,
      } as AuthUser;
    }

    // 2. Fallback ke cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;
    if (!token) return null;

    return verifyJWT(token, "access");
  } catch (err) {
    console.error(err);
    return null;
  }
}

/**
 * Mendapatkan user dari cookie (Client Side).
 * Membutuhkan accessToken tidak httpOnly.
 */
export function getUser(): AuthUser | null {
  if (typeof window === "undefined") return null;

  const match = document.cookie.match(new RegExp("(^| )accessToken=([^;]+)"));
  const token = match ? match[2] : null;

  if (!token) return null;

  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join(""),
    );

    const payload = JSON.parse(jsonPayload);
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      name: payload.name || null,
    } as AuthUser;
  } catch (err) {
    console.error(err);
    return null;
  }
}

// ─── API helpers ─────────────────────────────────────────────────────────────

async function authFetch(path: string, options: RequestInit = {}) {
  // Kita tidak lagi memasukkan Authorization header secara manual dari client
  // karena kita mengandalkan httpOnly cookie yang dikirim otomatis
  return fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    },
    credentials: "include",
  });
}

// ─── Token helpers (Client Side) ─────────────────────────────────────────────

export function setAccessToken(token: string) {
  if (typeof window === "undefined") return;
  const isProd = process.env.NODE_ENV === "production";
  const domain = isProd ? "domain=.kuizz.my.id; " : "";
  // 15 menit maxAge (sinkron dengan backend)
  document.cookie = `accessToken=${token}; path=/; ${domain}max-age=${15 * 60}; samesite=lax${isProd ? "; secure" : ""}`;
}

export function removeAccessToken() {
  if (typeof window === "undefined") return;
  const isProd = process.env.NODE_ENV === "production";
  const domain = isProd ? "domain=.kuizz.my.id; " : "";
  document.cookie = `accessToken=; path=/; ${domain}expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

// ─── Auth actions ─────────────────────────────────────────────────────────────

export async function register(email: string, password: string, name?: string) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name }),
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Registration failed");
  // Update: Set cookie juga di client (untuk instan UI)
  setAccessToken(data.accessToken);
  return data as { user: UserModelType; accessToken: string };
}

export async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Login failed");
  // Update: Set cookie juga di client (untuk instan UI)
  setAccessToken(data.accessToken);
  return data as { user: UserModelType; accessToken: string };
}

export async function logout() {
  await authFetch("/auth/logout", { method: "POST" }).catch(() => {});
  removeAccessToken();
}

export async function refreshAccessToken(): Promise<string | null> {
  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.accessToken;
}

export async function fetchMe(): Promise<UserModelType | null> {
  const res = await authFetch("/auth/me");
  if (!res.ok) return null;
  return res.json();
}

// ─── API fetch with auto-refresh ─────────────────────────────────────────────

export async function apiFetch(path: string, options: RequestInit = {}) {
  let res = await authFetch(path, options);

  if (res.status === 401) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      res = await authFetch(path, options);
    }
  }

  return res;
}
