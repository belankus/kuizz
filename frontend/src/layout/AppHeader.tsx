"use client";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/context/SidebarContext";
import { Bell, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useRef } from "react";

const AppHeader: React.FC = () => {
  const { toggleSidebar, toggleMobileSidebar } = useSidebar();

  const handleToggle = () => {
    if (window.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 flex h-[72px] w-full border-b border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="flex w-full items-center justify-between px-4 lg:px-8">
        {/* Left Section: Mobile Toggle & Mobile Logo */}
        <div className="flex items-center gap-4 lg:hidden">
          <button
            className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            onClick={handleToggle}
            aria-label="Toggle Sidebar"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 6H20M4 12H20M4 18H20"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <Link href="/">
            <Image
              src="/images/logo/logo.svg"
              alt="Logo"
              width={32}
              height={32}
            />
          </Link>
        </div>

        {/* Middle Section: Search Bar */}
        <div className="hidden max-w-2xl flex-1 px-4 sm:block lg:px-0">
          <form className="relative" onSubmit={(e) => e.preventDefault()}>
            <div className="relative flex w-full max-w-[480px] items-center">
              <Search
                className="absolute left-4 text-gray-400 dark:text-gray-500"
                size={18}
              />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search quizzes, collections, players... ⌘K"
                className="h-11 w-full rounded-full border-transparent bg-gray-50 pr-4 pl-11 text-sm text-gray-900 transition-all outline-none placeholder:text-gray-400 focus:border-gray-200 focus:bg-white focus:ring-4 focus:ring-[#46178f]/5 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-gray-700 dark:focus:bg-gray-900"
              />
            </div>
          </form>
        </div>

        {/* Right Section: Actions */}
        <div className="flex items-center gap-3 sm:gap-5">
          {/* Notification Bell */}
          <button className="relative rounded-full p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full border-2 border-white bg-red-500 dark:border-gray-900"></span>
          </button>

          {/* Create Quiz Button */}
          <Link href="/dashboard/create">
            <Button className="rounded-full bg-[#46178f] px-6 font-semibold text-white shadow-sm transition-all hover:bg-[#3b127a] hover:shadow-lg hover:shadow-[#46178f]/20">
              Create Quiz
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
