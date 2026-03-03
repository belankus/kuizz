"use client";
import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";
import { getUserFromToken, logout, apiFetch } from "@/lib/auth";
import Avatar from "@/components/avatar/Avatar";
import { AvatarModel } from "@/types";
import { UserModelType } from "@/types";
import {
  BarChart2,
  FolderOpen,
  GraduationCap,
  Grid,
  HelpCircle,
  Users,
  ChevronDownIcon,
  Download,
  Gamepad2,
} from "lucide-react";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
};

const navItems: NavItem[] = [
  {
    icon: <Grid size={20} />,
    name: "Dashboard",
    path: "/dashboard",
  },
  {
    icon: <Gamepad2 size={20} />,
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
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState<UserModelType | null>(null);
  const [avatar, setAvatar] = useState<AvatarModel | null>(null);

  useEffect(() => {
    const u = getUserFromToken();
    setUser(u);
    if (u) {
      apiFetch("/users/me")
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.avatar) setAvatar(data.avatar as AvatarModel);
        })
        .catch(() => null);
    }
  }, []);

  function toggleDropdown(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.stopPropagation();
    setIsDropdownOpen((prev) => !prev);
  }

  function closeDropdown() {
    setIsDropdownOpen(false);
  }

  async function handleLogout() {
    closeDropdown();
    await logout();
    router.push("/login");
  }

  const initials =
    user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "?";

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

  const isActive = useCallback((path: string) => path === pathname, [pathname]);

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
      <div className="relative border-t border-gray-100 p-4">
        <button
          onClick={toggleDropdown}
          className={`flex w-full items-center gap-3 rounded-xl p-2 transition-colors hover:cursor-pointer hover:bg-gray-50 ${
            !isExpanded && !isHovered ? "justify-center" : "text-left"
          }`}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-200">
            {avatar ? (
              <Avatar config={avatar} size={40} />
            ) : (
              <span className="flex h-full w-full items-center justify-center bg-[#46178f] text-sm font-semibold text-white">
                {initials}
              </span>
            )}
          </div>

          {(isExpanded || isHovered || isMobileOpen) && (
            <div className="min-w-0 flex-1">
              <h4 className="truncate text-sm font-bold text-gray-900">
                {user?.name || "—"}
              </h4>
              <p className="truncate text-xs text-gray-500">
                {user?.role === "SUPERADMIN" ? "Super Admin" : "Basic Plan"}
              </p>
            </div>
          )}

          {(isExpanded || isHovered || isMobileOpen) && (
            <div className="text-gray-400">
              <ChevronDownIcon
                size={16}
                className={`transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
              />
            </div>
          )}
        </button>

        <Dropdown
          isOpen={isDropdownOpen}
          onClose={closeDropdown}
          className={`absolute ${
            isExpanded || isHovered || isMobileOpen
              ? "right-4 left-4"
              : "left-4"
          } bottom-full z-50 mb-2 flex flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-lg ${
            !isExpanded && !isHovered && !isMobileOpen ? "w-[240px]" : ""
          }`}
        >
          <div className="flex items-center gap-3 border-b border-gray-200 pb-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-200">
              {avatar ? (
                <Avatar config={avatar} size={40} />
              ) : (
                <span className="flex h-full w-full items-center justify-center bg-[#46178f] text-sm font-semibold text-white">
                  {initials}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold text-gray-900">
                {user?.name || "—"}
              </span>
              <span className="block truncate text-xs text-gray-500">
                {user?.email || ""}
              </span>
              {user?.role === "SUPERADMIN" && (
                <span className="mt-1 inline-block rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-medium text-purple-600">
                  Super Admin
                </span>
              )}
            </div>
          </div>

          <ul className="flex flex-col gap-1 border-b border-gray-200 py-3">
            <li>
              <DropdownItem
                onItemClick={closeDropdown}
                tag="a"
                href="/dashboard/profile"
                className="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                <svg
                  className="fill-gray-500 group-hover:fill-gray-700"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 3.5C7.30558 3.5 3.5 7.30558 3.5 12C3.5 14.1526 4.3002 16.1184 5.61936 17.616C6.17279 15.3096 8.24852 13.5955 10.7246 13.5955H13.2746C15.7509 13.5955 17.8268 15.31 18.38 17.6167C19.6996 16.119 20.5 14.153 20.5 12C20.5 7.30558 16.6944 3.5 12 3.5ZM17.0246 18.8566V18.8455C17.0246 16.7744 15.3457 15.0955 13.2746 15.0955H10.7246C8.65354 15.0955 6.97461 16.7744 6.97461 18.8455V18.856C8.38223 19.8895 10.1198 20.5 12 20.5C13.8798 20.5 15.6171 19.8898 17.0246 18.8566ZM2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12Z"
                  />
                </svg>
                Edit Profil
              </DropdownItem>
            </li>
            {user?.role === "SUPERADMIN" && (
              <li>
                <DropdownItem
                  onItemClick={closeDropdown}
                  tag="a"
                  href="/dashboard/users"
                  className="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  <svg
                    className="fill-gray-500 group-hover:fill-gray-700"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M8 7a4 4 0 1 0 8 0A4 4 0 0 0 8 7m-4.243 9H20.243A7 7 0 0 0 8 14H8a7 7 0 0 0-4.243 2z"
                    />
                  </svg>
                  Manajemen User
                </DropdownItem>
              </li>
            )}
          </ul>

          <button
            onClick={handleLogout}
            className="group mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
          >
            <svg
              className="fill-gray-500 group-hover:fill-gray-700"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M15.1007 19.247C14.6865 19.247 14.3507 18.9112 14.3507 18.497L14.3507 14.245H12.8507V18.497C12.8507 19.7396 13.8581 20.747 15.1007 20.747H18.5007C19.7434 20.747 20.7507 19.7396 20.7507 18.497L20.7507 5.49609C20.7507 4.25345 19.7433 3.24609 18.5007 3.24609H15.1007C13.8581 3.24609 12.8507 4.25345 12.8507 5.49609V9.74501L14.3507 9.74501V5.49609C14.3507 5.08188 14.6865 4.74609 15.1007 4.74609L18.5007 4.74609C18.9149 4.74609 19.2507 5.08188 19.2507 5.49609L19.2507 18.497C19.2507 18.9112 18.9149 19.247 18.5007 19.247H15.1007ZM3.25073 11.9984C3.25073 12.2144 3.34204 12.4091 3.48817 12.546L8.09483 17.1556C8.38763 17.4485 8.86251 17.4487 9.15549 17.1559C9.44848 16.8631 9.44863 16.3882 9.15583 16.0952L5.81116 12.7484L16.0007 12.7484C16.4149 12.7484 16.7507 12.4127 16.7507 11.9984C16.7507 11.5842 16.4149 11.2484 16.0007 11.2484L5.81528 11.2484L9.15585 7.90554C9.44864 7.61255 9.44847 7.13767 9.15547 6.84488C8.86248 6.55209 8.3876 6.55226 8.09481 6.84525L3.52309 11.4202C3.35673 11.5577 3.25073 11.7657 3.25073 11.9984Z"
              />
            </svg>
            Keluar
          </button>
        </Dropdown>
      </div>
    </aside>
  );
};

export default AppSidebar;
