import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export default function HeroBanner() {
  return (
    <div className="mb-8 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
      <div>
        <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-gray-950 md:text-3xl dark:text-white/90">
          Welcome to Kuizz!
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Start by creating your first quiz and engaging your audience.
        </p>
      </div>
      <Link href="/dashboard/quizes?create=true">
        <Button className="rounded-full bg-[#e54d1f] px-6 py-5 font-semibold text-white shadow-sm transition-all hover:bg-[#b23c18] hover:shadow-lg hover:shadow-[#e54d1f]/20 dark:bg-orange-500 dark:text-white/90 dark:hover:bg-orange-600">
          <Plus className="mr-2 h-5 w-5" />
          Create Your First Quiz
        </Button>
      </Link>
    </div>
  );
}
