"use client";
import type React from "react";

interface DropdownProps {
  isOpen: boolean;
  children: React.ReactNode;
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  isOpen,
  children,
  className = "",
}) => {
  return (
    <div
      className={`shadow-theme-lg dark:bg-gray-dark absolute right-0 z-40 mt-2 origin-top-right rounded-xl border border-gray-200 bg-white transition-all duration-200 ease-out dark:border-gray-800 ${
        isOpen
          ? "pointer-events-auto visible translate-y-0 scale-100 opacity-100"
          : "pointer-events-none invisible -translate-y-2 scale-95 opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  );
};
