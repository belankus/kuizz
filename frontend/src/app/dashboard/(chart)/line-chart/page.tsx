import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";
import { useTranslations } from "next-intl";

export const metadata: Metadata = {
  title: "Next.js Line Chart | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Line Chart page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};
export default function LineChart() {
  const t = useTranslations("Dashboard");
  return (
    <div>
      <PageBreadcrumb pageTitle={t("lineChart")} />
      <div className="space-y-6">
        <ComponentCard title={t("lineChartOne")}>l </ComponentCard>
      </div>
    </div>
  );
}
