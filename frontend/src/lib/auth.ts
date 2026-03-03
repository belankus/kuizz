import { UserModelType } from "@/types";
import { jwtDecode } from "jwt-decode";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// ─── Storage helpers (access token in memory / sessionStorage) ───────────────

const TOKEN_KEY = "kuizz_access_token";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setAccessToken(token: string) {
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function removeAccessToken() {
  sessionStorage.removeItem(TOKEN_KEY);
}

export function getUserFromToken(): UserModelType | null {
  const token = getAccessToken();
  if (!token) return null;
  try {
    const decoded = jwtDecode<UserModelType>(token);
    return {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name || null,
      role: decoded.role,
      provider: decoded.provider,
      createdAt: decoded.createdAt,
    };
  } catch {
    return null;
  }
}

// ─── API helpers ─────────────────────────────────────────────────────────────

async function authFetch(path: string, options: RequestInit = {}) {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  return fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: "include", // send httpOnly cookie for refresh token
  });
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
  setAccessToken(data.accessToken);
  return data as { user: UserModelType; accessToken: string };
}

export async function logout() {
  const token = getAccessToken();
  if (token) {
    await authFetch("/auth/logout", { method: "POST" }).catch(() => {});
  }
  removeAccessToken();
}

export async function refreshAccessToken(): Promise<string | null> {
  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) return null;
  const data = await res.json();
  setAccessToken(data.accessToken);
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

  // Try token refresh on 401
  if (res.status === 401) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      res = await authFetch(path, options);
    }
  }

  return res;
}
