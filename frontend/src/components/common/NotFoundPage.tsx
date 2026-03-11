"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Home, Search, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface NotFoundPageProps {
  message?: string;
  requestPath?: string;
}

const NotFoundPage: React.FC<NotFoundPageProps> = ({
  message = "We can't seem to find the page you're looking for.",
  requestPath,
}) => {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col bg-[#F9FAFB] font-sans text-gray-900">
      {/* Header */}
      <header className="flex h-[72px] w-full shrink-0 items-center justify-between border-b border-gray-100 bg-white px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Image
            src="/images/logo/logo.svg"
            alt="Kuizz Logo"
            width={32}
            height={32}
          />
          <span className="text-xl font-bold tracking-tight text-[#e54d1f]">
            Kuizz Global
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-2 rounded-full border border-gray-100 bg-gray-50 px-3 py-1.5 sm:flex">
            <Shield size={16} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-600">
              Enterprise Edition
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 flex-col items-center justify-center p-6 text-center sm:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex w-full max-w-2xl flex-col items-center"
        >
          {/* Illustration Section */}
          <div className="mb-8">
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-white shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] sm:h-32 sm:w-32">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#A855F7] sm:h-16 sm:w-16">
                <Search className="h-6 w-6 text-white sm:h-8 sm:w-8" />
              </div>
            </div>
          </div>

          <h1 className="mb-3 text-3xl font-extrabold text-[#111827] sm:text-4xl">
            Page Not Found
          </h1>

          <div className="mb-6 font-mono text-sm font-bold tracking-widest text-[#A855F7] uppercase">
            ERROR 404
          </div>

          <p className="mb-10 max-w-md text-base leading-relaxed text-gray-500 sm:text-lg">
            {message}
            {requestPath && (
              <span className="mt-2 block font-mono text-xs text-gray-400 italic">
                Path: {requestPath}
              </span>
            )}
          </p>

          <div className="mb-12 flex w-full flex-col gap-4 sm:w-auto sm:flex-row">
            <Button
              onClick={() => router.push("/dashboard")}
              className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#A855F7] px-8 text-base font-semibold text-white shadow-lg shadow-purple-500/20 transition-all hover:bg-[#9333EA]"
            >
              <Home size={20} />
              Return Home
            </Button>
            <Button
              variant="secondary"
              onClick={() => router.back()}
              className="flex h-12 items-center justify-center gap-2 rounded-xl border-none bg-[#F3F4F6] px-8 text-base font-semibold text-gray-700 transition-all hover:bg-[#E5E7EB]"
            >
              <ArrowLeft size={20} />
              Go Back
            </Button>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="flex shrink-0 flex-col items-center justify-center py-12">
        <p className="text-xs text-gray-400">
          © {new Date().getFullYear()} Kuizz Global. All systems operational.
        </p>
      </footer>
    </div>
  );
};

export default NotFoundPage;
