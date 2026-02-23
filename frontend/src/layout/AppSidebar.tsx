"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import {
  BarChart2,
  FolderOpen,
  GraduationCap,
  Grid,
  HelpCircle,
  Users,
  ChevronDownIcon,
  Download,
} from "lucide-react";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
};

const navItems: NavItem[] = [
  {
    icon: <Grid size={20} />,
    name: "My Quizzes",
    path: "/dashboard/quizes",
  },
  {
    icon: <BarChart2 size={20} />,
    name: "Reports",
    path: "/dashboard/reports",
  },
  {
    name: "Collections",
    icon: <FolderOpen size={20} />,
    path: "/dashboard/collections",
  },
  {
    name: "Team Space",
    icon: <Users size={20} />,
    path: "/dashboard/team",
  },
  {
    icon: <Download size={20} />,
    name: "Import",
    path: "/dashboard/import",
  },
];

const resourcesItems: NavItem[] = [
  {
    icon: <GraduationCap size={20} />,
    name: "Academy",
    path: "/academy",
  },
  {
    icon: <HelpCircle size={20} />,
    name: "Help Center",
    path: "/help",
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();

  const renderMenuItems = (navItems: NavItem[]) => (
    <ul className="flex flex-col gap-2">
      {navItems.map((nav) => (
        <li key={nav.name}>
          {nav.path && (
            <Link
              href={nav.path}
              className={`flex items-center gap-3 rounded-xl px-4 py-2.5 transition-colors ${
                isActive(nav.path)
                  ? "bg-[#F3E8FF] font-semibold text-[#46178f]"
                  : "font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <span
                className={
                  isActive(nav.path) ? "text-[#46178f]" : "text-gray-500"
                }
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="text-[15px]">{nav.name}</span>
              )}
            </Link>
          )}
        </li>
      ))}
    </ul>
  );

  const isActive = useCallback(
    (path: string) =>
      path === pathname ||
      (path === "/dashboard/quizes" && pathname === "/dashboard"),
    [pathname],
  );

  return (
    <aside
      className={`fixed top-0 left-0 z-50 mt-16 flex h-screen flex-col border-r border-gray-200 bg-white transition-all duration-300 ease-in-out lg:mt-0 ${
        isExpanded || isMobileOpen ? "w-64" : isHovered ? "w-64" : "w-20"
      } ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`flex h-[72px] items-center border-b border-gray-100 px-6 ${
          !isExpanded && !isHovered ? "px-0 lg:justify-center" : "justify-start"
        }`}
      >
        <Link href="/" className="flex items-center gap-2">
          {isExpanded || isHovered || isMobileOpen ? (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#46178f] text-xl leading-none font-bold text-white">
                K
              </div>
              <span className="text-2xl font-bold tracking-tight text-[#46178f]">
                Kuizz
              </span>
            </div>
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#46178f] text-xl leading-none font-bold text-white">
              K
            </div>
          )}
        </Link>
      </div>

      <div className="no-scrollbar flex flex-1 flex-col overflow-y-auto px-4 py-6">
        <nav className="mb-8">
          <div className="flex flex-col gap-8">
            <div>{renderMenuItems(navItems)}</div>

            <div>
              <h2
                className={`mb-3 flex px-4 text-[11px] font-bold tracking-wider text-gray-400 uppercase ${
                  !isExpanded && !isHovered
                    ? "px-0 lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? "RESOURCES" : "•••"}
              </h2>
              {renderMenuItems(resourcesItems)}
            </div>
          </div>
        </nav>
      </div>

      {/* User Profile Section at Bottom */}
      <div className="border-t border-gray-100 p-4">
        <div
          className={`flex items-center gap-3 ${!isExpanded && !isHovered ? "justify-center" : ""}`}
        >
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://api.dicebear.com/7.x/notionists/svg?seed=Alex&backgroundColor=transparent"
              alt="User"
              className="h-full w-full object-cover"
            />
          </div>

          {(isExpanded || isHovered || isMobileOpen) && (
            <div className="min-w-0 flex-1">
              <h4 className="truncate text-sm font-bold text-gray-900">
                Alex Teacher
              </h4>
              <p className="truncate text-xs text-gray-500">Basic Plan</p>
            </div>
          )}

          {(isExpanded || isHovered || isMobileOpen) && (
            <button className="text-gray-400 hover:text-gray-600">
              <ChevronDownIcon size={16} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar;
