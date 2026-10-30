import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";
import { useTranslations } from "next-intl";

export const metadata: Metadata = {
  title: "Next.js Bar Chart | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Bar Chart page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

export default function BarChart() {
  const t = useTranslations("Dashboard");
  return (
    <div>
      <PageBreadcrumb pageTitle={t("barChart")} />
      <div className="space-y-6">
        <ComponentCard title={t("barChartOne")}>s</ComponentCard>
      </div>
    </div>
  );
}
