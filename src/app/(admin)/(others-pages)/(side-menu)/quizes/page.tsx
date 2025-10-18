import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import BasicTableOne from "@/components/tables/BasicTableOne";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Next.js Basic Table | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Basic Table  page for TailAdmin  Tailwind CSS Admin Dashboard Template",
  // other metadata
};

export default function BasicTables() {
  const sessionId = Array(10)
    .fill(0)
    .map((_, index) => (_ = index));

  console.log(sessionId);
  return (
    <div>
      <PageBreadcrumb pageTitle="Quizes" />
      <div className="flex w-full flex-wrap justify-start gap-6">
        {sessionId.map((key, value) => (
          <div
            key={key}
            className="h-32 w-52 shrink-0 basis-52 rounded-2xl border bg-white"
          ></div>
        ))}
      </div>
    </div>
  );
}
