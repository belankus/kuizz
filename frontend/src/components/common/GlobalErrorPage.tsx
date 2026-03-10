"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  RefreshCcw,
  ArrowLeft,
  ChevronDown,
  Copy,
  Check,
  Shield,
  BarChart3,
  Cloud,
  Terminal,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlobalErrorPageProps {
  errorCode?: string;
  message?: string;
  traceId?: string;
  timestamp?: string;
  service?: string;
  requestPath?: string;
  environment?: string;
  onRetry?: () => void;
}

const GlobalErrorPage: React.FC<GlobalErrorPageProps> = ({
  errorCode = "API-500",
  message = "Internal Server Error",
  traceId = "9f4a2c1b6d7e8f91",
  timestamp = new Date().toISOString().replace("T", " ").substring(0, 19) +
    " UTC",
  service = "quiz-api",
  requestPath = "/api/v1/quizzes",
  environment = "production",
  onRetry,
}) => {
  const router = useRouter();
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyTraceId = () => {
    navigator.clipboard.writeText(traceId);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F9FAFB] font-sans text-gray-900">
      {/* Error Header */}
      <header className="flex h-[72px] w-full shrink-0 items-center justify-between border-b border-gray-100 bg-white px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Image
            src="/images/logo/logo.svg"
            alt="Kuizz Logo"
            width={32}
            height={32}
          />
          <span className="text-xl font-bold tracking-tight text-[#46178f]">
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
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-purple-100 bg-[#E9D5FF]">
            <div className="h-6 w-6 rounded-full bg-[#D8B4FE]" />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex flex-1 flex-col items-center justify-center overflow-y-auto p-6 sm:p-12">
        <div className="flex w-full max-w-2xl flex-col items-center text-center">
          {/* Illustration Section */}
          <div className="mb-8">
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-white shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] sm:h-32 sm:w-32">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#A855F7] sm:h-16 sm:w-16">
                <Activity className="h-6 w-6 text-white sm:h-8 sm:w-8" />
              </div>
            </div>
          </div>

          <h1 className="mb-3 text-3xl font-extrabold text-[#111827] sm:text-4xl">
            Something went wrong
          </h1>

          <div className="mb-6 font-mono text-sm font-bold tracking-widest text-[#A855F7] uppercase">
            {errorCode}
          </div>

          <p className="mb-10 max-w-md text-base leading-relaxed text-gray-500 sm:text-lg">
            The application encountered an unexpected error. Please try again or
            reload the page.
          </p>

          <div className="mb-12 flex w-full flex-col gap-4 sm:w-auto sm:flex-row">
            <Button
              onClick={onRetry || (() => window.location.reload())}
              className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#A855F7] px-8 text-base font-semibold text-white shadow-lg shadow-purple-500/20 transition-all hover:bg-[#9333EA]"
            >
              <RefreshCcw size={20} />
              Retry
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

          <div className="mb-10 h-px w-full bg-gray-100" />

          <p className="mb-6 text-sm text-gray-500">
            If the problem persists, please contact{" "}
            <span className="cursor-pointer font-medium text-[#A855F7] hover:underline">
              support
            </span>
            .
          </p>

          <button
            onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
            className="mb-8 flex items-center gap-2 text-[11px] font-bold tracking-widest text-gray-400 uppercase transition-colors hover:text-gray-600"
          >
            View Technical Details
            <ChevronDown
              size={14}
              className={cn(
                "transition-transform duration-300",
                isDetailsExpanded ? "rotate-180" : "",
              )}
            />
          </button>

          {/* Technical Details Panel */}
          <AnimatePresence>
            {isDetailsExpanded && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="w-full text-left"
              >
                <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm ring-1 ring-gray-900/5 sm:p-8">
                  <div className="mb-8 flex items-center justify-between border-b border-gray-50 pb-4">
                    <h2 className="text-sm font-bold tracking-widest text-gray-900 uppercase">
                      Technical Details
                    </h2>
                    <Terminal size={18} className="text-[#A855F7] opacity-50" />
                  </div>

                  <div className="grid grid-cols-1 gap-x-12 gap-y-6 md:grid-cols-2">
                    <div>
                      <div className="mb-1.5 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                        Error Code
                      </div>
                      <div className="font-mono text-sm text-gray-700">
                        {errorCode}
                      </div>
                    </div>
                    <div>
                      <div className="mb-1.5 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                        Message
                      </div>
                      <div className="font-mono text-sm text-gray-700">
                        {message}
                      </div>
                    </div>
                    <div>
                      <div className="mb-1.5 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                        Service
                      </div>
                      <div className="font-mono text-sm text-gray-700">
                        {service}
                      </div>
                    </div>
                    <div>
                      <div className="mb-1.5 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                        Timestamp
                      </div>
                      <div className="font-mono text-sm text-gray-700">
                        {timestamp}
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <div className="mb-1.5 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                        Request Path
                      </div>
                      <div className="font-mono text-sm text-gray-700">
                        {requestPath}
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <div className="mb-1.5 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                        Trace ID
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="rounded-lg border border-purple-100 bg-[#FAF5FF] px-3 py-2 font-mono text-sm text-gray-700">
                          {traceId}
                        </div>
                        <button
                          onClick={handleCopyTraceId}
                          className="flex items-center gap-2 rounded-lg border border-purple-100 bg-[#FAF5FF] px-3 py-2 text-xs font-bold tracking-wider text-[#A855F7] uppercase transition-colors hover:bg-[#F3E8FF]"
                        >
                          {isCopied ? <Check size={14} /> : <Copy size={14} />}
                          {isCopied ? "Copied" : "Copy"}
                        </button>
                      </div>
                    </div>
                    <div>
                      <div className="mb-1.5 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                        Environment
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                        <span className="font-mono text-sm text-gray-700">
                          {environment}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer Section */}
      <footer className="flex shrink-0 flex-col items-center justify-center py-12">
        <div className="mb-4 flex items-center gap-6">
          <BarChart3 size={20} className="text-gray-400" />
          <Shield size={20} className="text-gray-400" />
          <Cloud size={20} className="text-gray-400" />
        </div>
        <p className="text-xs text-gray-400">
          © {new Date().getFullYear()} Kuizz Global. All systems operational
          (except this one).
        </p>
      </footer>
    </div>
  );
};

export default GlobalErrorPage;
