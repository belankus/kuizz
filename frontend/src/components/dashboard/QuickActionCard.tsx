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
      <Card className="h-full cursor-pointer p-6 transition-all duration-200 hover:-translate-y-1 hover:border-[#46178f]/30 hover:shadow-lg hover:shadow-[#46178f]/5">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#f3e8ff] text-[#46178f] transition-transform group-hover:scale-110">
          <Icon size={24} />
        </div>
        <h3 className="mb-1 text-base font-bold text-gray-900 group-hover:text-[#46178f]">
          {title}
        </h3>
        <p className="text-sm text-gray-500">{description}</p>
      </Card>
    </Link>
  );
}
