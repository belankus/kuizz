/**
 * Konfigurasi URL terpusat
 * Semua URL yang dibutuhkan frontend diambil dari environment variable
 */

/** URL backend API (NestJS) */
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

/** URL backend Socket.IO (biasanya sama dengan API) */
export const SOCKET_URL =
  process.env.SOCKET_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3001";

export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
