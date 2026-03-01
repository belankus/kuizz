"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { login, register } from "@/lib/auth";
import { toast } from "sonner";
import { Fredoka } from "next/font/google";
import Image from "next/image";
import { API_URL } from "@/lib/config";

const fredoka = Fredoka({ subsets: ["latin"], weight: ["500", "600", "700"] });

interface AuthContainerProps {
  mode: "login" | "register";
}

export default function AuthContainer({ mode }: AuthContainerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const redirectTo = searchParams.get("redirect") || "/dashboard";
  const isLogin = mode === "login";

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!isLogin && password.length < 6) {
      toast.error("Password minimal 6 karakter");
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
        toast.success("Login berhasil!");
        router.push(redirectTo);
      } else {
        await register(email, password, name || undefined);
        toast.success("Akun berhasil dibuat!");
        router.push("/dashboard");
      }
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : isLogin
            ? "Login gagal"
            : "Registrasi gagal",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F4F5F7] p-4 sm:p-8">
      <div className="flex min-h-[600px] w-full max-w-[1000px] flex-col overflow-hidden rounded-3xl bg-white shadow-xl md:flex-row">
        {/* LEFT COLUMN - Branding */}
        <div className="relative flex flex-col items-center justify-center overflow-hidden bg-[#46178F] p-10 text-white md:w-5/12">
          <div className="relative z-10 flex flex-col items-center text-center">
            {/* Avatar/Illustration Placeholder */}
            <div className="bg-brand-400/20 relative mb-8 flex h-56 w-56 items-center justify-center rounded-full border-[6px] border-[#5a2ab3]">
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 flex h-12 w-12 rotate-12 items-center justify-center rounded-xl bg-[#FFC000] shadow-lg">
                <span className="material-symbols-outlined text-2xl text-white">
                  lightbulb
                </span>
              </div>
              <div className="absolute -bottom-6 -left-6 flex h-14 w-14 -rotate-12 items-center justify-center rounded-2xl bg-[#FF2B5E] shadow-lg">
                <span className="material-symbols-outlined text-3xl text-white">
                  favorite
                </span>
              </div>

              {/* Character placeholder */}
              <Image
                src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=transparent"
                alt="Illustration"
                width={160}
                height={160}
                className="object-cover"
              />
            </div>

            <h2
              className={`${fredoka.className} mb-4 text-3xl font-bold md:text-4xl`}
            >
              Ready for a challenge?
            </h2>
            <p className="mb-8 max-w-[250px] text-sm leading-relaxed text-[#D6C5F3] md:text-base">
              Join the world&apos;s most engaging learning game community!
            </p>

            <div className="flex gap-2">
              <div className="h-2 w-2 rounded-full bg-white/50"></div>
              <div className="h-2 w-2 rounded-full bg-white"></div>
              <div className="h-2 w-2 rounded-full bg-white/50"></div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - Form */}
        <div className="flex flex-col justify-center bg-white p-8 md:w-7/12 md:p-12 lg:p-16">
          {/* Toggle */}
          <div className="mx-auto mb-10 flex w-full max-w-[320px] rounded-xl bg-[#F2F2F2] p-1">
            <Link
              href="/login"
              className={`flex-1 rounded-lg py-2.5 text-center text-sm font-bold transition-all ${isLogin ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              Log In
            </Link>
            <Link
              href="/register"
              className={`flex-1 rounded-lg py-2.5 text-center text-sm font-bold transition-all ${!isLogin ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              Sign Up
            </Link>
          </div>

          <div className="mx-auto w-full max-w-[400px]">
            <h1
              className={`${fredoka.className} mb-2 flex items-center gap-2 text-3xl font-bold text-gray-900`}
            >
              {isLogin ? "Welcome back!" : "Create an account"}
              <span>{isLogin ? "👋" : "✨"}</span>
            </h1>
            <p className="mb-8 text-sm text-gray-500">
              {isLogin
                ? "Please enter your details to sign in."
                : "Enter your details to get started."}
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-gray-700">
                    Name (optional)
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-4 text-[20px] text-gray-400">
                      person
                    </span>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full rounded-xl border border-transparent bg-[#F8F9FA] py-3 pr-4 pl-11 text-sm font-medium text-gray-800 transition-all outline-none placeholder:text-gray-400 focus:border-[#46178F] focus:bg-white focus:ring-2 focus:ring-[#46178F]/20"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-sm font-bold text-gray-700">
                  {isLogin ? "Username or Email" : "Email"}
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-4 text-[20px] text-gray-400">
                    person
                  </span>
                  <input
                    type={isLogin ? "text" : "email"}
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Start typing..."
                    className="w-full rounded-xl border border-transparent bg-[#F8F9FA] py-3 pr-4 pl-11 text-sm font-medium text-gray-800 transition-all outline-none placeholder:text-gray-400 focus:border-[#46178F] focus:bg-white focus:ring-2 focus:ring-[#46178F]/20"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-bold text-gray-700">
                  Password
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-4 text-[20px] text-gray-400">
                    lock
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    minLength={!isLogin ? 6 : undefined}
                    className="w-full rounded-xl border border-transparent bg-[#F8F9FA] py-3 pr-11 pl-11 text-sm font-medium text-gray-800 transition-all outline-none placeholder:text-gray-400 focus:border-[#46178F] focus:bg-white focus:ring-2 focus:ring-[#46178F]/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 flex items-center text-gray-400 transition-colors hover:text-gray-600"
                    tabIndex={-1}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              {isLogin && (
                <div className="flex justify-end pt-1">
                  <Link
                    href="#"
                    className="text-xs font-bold text-[#46178F] transition-colors hover:text-[#34116c]"
                  >
                    Forgot password?
                  </Link>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#46178F] px-4 py-3.5 text-sm font-bold text-white shadow-[0_4px_0_rgba(0,0,0,0.15)] transition-all hover:translate-y-[1px] hover:bg-[#34116c] hover:shadow-[0_3px_0_rgba(0,0,0,0.15)] active:translate-y-[4px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading
                  ? isLogin
                    ? "Signing in..."
                    : "Creating..."
                  : isLogin
                    ? "Let's Play"
                    : "Sign Up"}
                {!loading && (
                  <span className="material-symbols-outlined text-[20px]">
                    arrow_forward
                  </span>
                )}
              </button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-[10px] font-bold tracking-wider uppercase">
                <span className="bg-white px-3 text-gray-400">OR</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <a
                href={`${API_URL}/auth/google`}
                className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Google
              </a>
              <a
                href={`${API_URL}/auth/github`}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#24292F] px-4 py-3 text-sm font-bold text-white shadow-[0_4px_0_rgba(0,0,0,0.2)] transition-colors hover:translate-y-[1px] hover:bg-[#1f2328] hover:shadow-[0_3px_0_rgba(0,0,0,0.2)] active:translate-y-[4px] active:shadow-none"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                GitHub
              </a>
            </div>

            <p className="mt-8 text-center text-[11px] font-medium text-gray-400">
              By continuing, you agree to our{" "}
              <Link
                href="#"
                className="underline transition-colors hover:text-gray-600"
              >
                Terms of Service
              </Link>{" "}
              &{" "}
              <Link
                href="#"
                className="underline transition-colors hover:text-gray-600"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
