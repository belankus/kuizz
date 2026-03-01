"use client";
import React, { useState, useEffect } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { getUserFromToken, logout, apiFetch } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Avatar from "@/components/avatar/Avatar";
import { AvatarModel } from "@repo/types";
import { UserModelType } from "@repo/types";

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<UserModelType | null>(null);
  const [avatar, setAvatar] = useState<AvatarModel | null>(null);
  const router = useRouter();

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
    setIsOpen((prev) => !prev);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  async function handleLogout() {
    closeDropdown();
    await logout();
    router.push("/login");
  }

  const initials =
    user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "?";

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="dropdown-toggle flex items-center text-gray-700 dark:text-gray-400"
      >
        {/* Avatar or initials */}
        <span className="mr-3 flex h-11 w-11 items-center justify-center overflow-hidden rounded-full">
          {avatar ? (
            <Avatar config={avatar} size={44} />
          ) : (
            <span className="bg-brand-500 flex h-full w-full items-center justify-center text-sm font-semibold text-white">
              {initials}
            </span>
          )}
        </span>
        <span className="text-theme-sm mr-1 block font-medium">
          {user?.name || user?.email?.split("@")[0] || "Loading..."}
        </span>
        <svg
          className={`stroke-gray-500 transition-transform duration-200 dark:stroke-gray-400 ${
            isOpen ? "rotate-180" : ""
          }`}
          width="18"
          height="20"
          viewBox="0 0 18 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="shadow-theme-lg dark:bg-gray-dark absolute right-0 mt-[17px] flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 dark:border-gray-800"
      >
        {/* User info with avatar */}
        <div className="flex items-center gap-3 border-b border-gray-200 pb-3 dark:border-gray-800">
          <div className="shrink-0 overflow-hidden rounded-full ring-2 ring-indigo-100 dark:ring-indigo-900/40">
            {avatar ? (
              <Avatar config={avatar} size={40} />
            ) : (
              <span className="bg-brand-500 flex h-10 w-10 items-center justify-center text-sm font-semibold text-white">
                {initials}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <span className="text-theme-sm block truncate font-medium text-gray-700 dark:text-gray-400">
              {user?.name || "—"}
            </span>
            <span className="text-theme-xs mt-0.5 block truncate text-gray-500 dark:text-gray-400">
              {user?.email || ""}
            </span>
            {user?.role === "SUPERADMIN" && (
              <span className="mt-1.5 inline-block rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                Super Admin
              </span>
            )}
          </div>
        </div>

        <ul className="flex flex-col gap-1 border-b border-gray-200 py-3 dark:border-gray-800">
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              href="/dashboard/profile"
              className="group text-theme-sm flex items-center gap-3 rounded-lg px-3 py-2 font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              <svg
                className="fill-gray-500 group-hover:fill-gray-700 dark:fill-gray-400 dark:group-hover:fill-gray-300"
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
                  fill=""
                />
              </svg>
              Edit profil
            </DropdownItem>
          </li>
          {user?.role === "SUPERADMIN" && (
            <li>
              <DropdownItem
                onItemClick={closeDropdown}
                tag="a"
                href="/dashboard/users"
                className="group text-theme-sm flex items-center gap-3 rounded-lg px-3 py-2 font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                <svg
                  className="fill-gray-500 group-hover:fill-gray-700 dark:fill-gray-400 dark:group-hover:fill-gray-300"
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
                    fill=""
                  />
                </svg>
                Manajemen User
              </DropdownItem>
            </li>
          )}
        </ul>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="group text-theme-sm mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
        >
          <svg
            className="fill-gray-500 group-hover:fill-gray-700 dark:group-hover:fill-gray-300"
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
              fill=""
            />
          </svg>
          Keluar
        </button>
      </Dropdown>
    </div>
  );
}
