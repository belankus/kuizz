import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";
import { useTranslations } from "next-intl";

export const metadata: Metadata = {
  title: "Next.js Blank Page | TailAdmin - Next.js Dashboard Template",
  description: "This is Next.js Blank Page TailAdmin Dashboard Template",
};

export default function BlankPage() {
  const t = useTranslations("Dashboard");
  return (
    <div>
      <PageBreadcrumb pageTitle={t("blankPage")} />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 xl:px-10 xl:py-12 dark:border-gray-800 dark:bg-white/3">
        <div className="mx-auto w-full max-w-157.5 text-center">
          <h3 className="text-theme-xl mb-4 font-semibold text-gray-800 sm:text-2xl dark:text-white/90">
            {t("cardTitle")}
          </h3>
          <p className="text-sm text-gray-500 sm:text-base dark:text-gray-400">
            {t("blankDescription")}
          </p>
        </div>
      </div>
    </div>
  );
}
