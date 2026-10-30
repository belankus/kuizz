"use client";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/context/SidebarContext";
import {
  Check,
  ChevronDown,
  Languages,
  LogOut,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import React, { useEffect, useRef } from "react";
import { logout } from "@/lib/auth";
import { toast } from "sonner";
import { useLocale, useTranslations } from "next-intl";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const supportedLocales = [
  { code: "en", labelKey: "english" },
  { code: "fr", labelKey: "french" },
] as const;

const AppHeader: React.FC = () => {
  const { toggleSidebar, toggleMobileSidebar } = useSidebar();
  const router = useRouter();
  const handleToggle = () => {
    if (window.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  const inputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations("Header");
  const locale = useLocale();

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

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  function handleLanguageChange(nextLocale: string) {
    if (nextLocale === locale) return;

    document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000`;
    document.cookie = "NEXT_LOCALE_MANUAL=1; path=/; max-age=31536000";
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 flex h-[72px] w-full border-b border-gray-100 bg-white">
      <div className="flex w-full items-center justify-between px-4 lg:px-8">
        {/* Left Section: Mobile Toggle & Mobile Logo */}
        <div className="flex items-center gap-4 lg:hidden">
          <button
            className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100"
            onClick={handleToggle}
            aria-label={t("toggleSidebar")}
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
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#46178f] text-xl leading-none font-bold text-white">
              K
            </div>
          </Link>
        </div>

        {/* Middle Section: Search Bar */}
        <div className="hidden max-w-2xl flex-1 px-4 sm:block lg:px-0">
          <form className="relative" onSubmit={(e) => e.preventDefault()}>
            <div className="relative flex w-full max-w-[480px] items-center">
              <Search className="absolute left-4 text-gray-400" size={18} />
              <input
                ref={inputRef}
                type="text"
                placeholder={t("searchPlaceholder")}
                className="h-11 w-full rounded-full border-transparent bg-gray-50 pr-4 pl-11 text-sm text-gray-900 transition-all outline-none placeholder:text-gray-400 focus:border-gray-200 focus:bg-white focus:ring-4 focus:ring-[#46178f]/5"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    toast.info(t("searchNotImplemented"));
                  }
                }}
              />
            </div>
          </form>
        </div>

        {/* Right Section: Actions */}
        <div className="flex items-center gap-3 sm:gap-5">
          {/* Notification Bell 
          <button className="relative rounded-full p-2 text-gray-600 transition-colors hover:bg-gray-100">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full border-2 border-white bg-red-500"></span>
          </button>*/}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center gap-1.5 rounded-full p-2 text-gray-600 transition-colors hover:bg-gray-100"
                aria-label={t("changeLanguage")}
              >
                <Languages size={20} />
                <span className="hidden text-xs font-semibold uppercase sm:inline">
                  {locale}
                </span>
                <ChevronDown size={14} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-36">
              {supportedLocales.map((supportedLocale) => (
                <DropdownMenuItem
                  key={supportedLocale.code}
                  onSelect={() => handleLanguageChange(supportedLocale.code)}
                  className="justify-between"
                >
                  {t(`languages.${supportedLocale.labelKey}`)}
                  {locale === supportedLocale.code && (
                    <Check className="h-4 w-4" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            onClick={handleLogout}
            className="relative rounded-full p-2 text-gray-600 transition-colors hover:bg-gray-100"
            aria-label={t("logout")}
          >
            <LogOut size={20} />
          </button>

          {/* Upgrade Button */}
          <Button className="rounded-full bg-[#46178f] px-6 font-semibold text-white shadow-sm transition-all hover:bg-[#3b127a] hover:shadow-lg hover:shadow-[#46178f]/20" onClick={() => router.push("/join")}>
            {t("play")}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
