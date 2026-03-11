import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { LucideIcon } from "lucide-react";

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
}

export default function QuickActionCard({
  title,
  description,
  icon: Icon,
  href,
}: QuickActionCardProps) {
  return (
    <Link href={href} className="group block h-full">
      <Card className="h-full cursor-pointer p-6 transition-all duration-200 hover:-translate-y-1 hover:border-[#e54d1f]/30 hover:shadow-lg hover:shadow-[#e54d1f]/5 dark:hover:border-orange-400/50 dark:hover:shadow-orange-500/10">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#fff3eb] text-[#e54d1f] transition-transform group-hover:scale-110 dark:bg-orange-500/20 dark:text-orange-400">
          <Icon size={24} />
        </div>
        <h3 className="mb-1 text-base font-bold text-gray-900 group-hover:text-[#e54d1f] dark:text-white/90 dark:group-hover:text-orange-400">
          {title}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      </Card>
    </Link>
  );
}
