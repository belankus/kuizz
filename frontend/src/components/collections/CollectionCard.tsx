import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreHorizontal, Layers, Eye, Plus } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { CollectionVisibility } from "@/types";

export type CollectionType = CollectionVisibility | "NEW";

export interface CollectionCardProps {
  id: string;
  title: string;
  description: string | null;
  type: CollectionType;
  ownerName: string;
  ownerAvatar?: string;
  itemsCount: number;
  viewsCount: number;
  updatedAt: string;
  extraContributors?: number;
  contentBadgeStr?: string;
}

const colorMap: Record<CollectionType, string> = {
  PUBLIC: "bg-gradient-to-br from-purple-500 to-indigo-600",
  SHARED: "bg-gradient-to-br from-emerald-400 to-teal-500",
  PRIVATE: "bg-gradient-to-br from-orange-400 to-amber-500",
  NEW: "bg-gradient-to-br from-pink-500 to-rose-500",
};

export function CollectionCard({
  id,
  title,
  description,
  type,
  ownerName,
  ownerAvatar,
  itemsCount,
  viewsCount,
  updatedAt,
  extraContributors,
  contentBadgeStr = "Mixed",
}: CollectionCardProps) {
  return (
    <div className="group relative flex h-[340px] flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 transition-all hover:shadow-md dark:bg-gray-900/50 dark:ring-gray-800">
      {/* Cover Image/Gradient */}
      <Link
        href={`/dashboard/collections/${id}`}
        className="absolute inset-0 z-0"
      />
      <div className={`h-[120px] w-full shrink-0 p-4 ${colorMap[type]}`}>
        <div className="flex items-start justify-between">
          <Badge
            variant="secondary"
            className="border-none bg-white/20 text-[10px] font-semibold tracking-wider text-white uppercase hover:bg-white/30"
          >
            {type}
          </Badge>
          <Badge
            variant="secondary"
            className="border-none bg-black/20 text-[10px] font-semibold tracking-wider text-white uppercase backdrop-blur-sm hover:bg-black/30"
          >
            {itemsCount} {contentBadgeStr}
          </Badge>
        </div>
      </div>

      <div className="pointer-events-none z-10 flex h-full flex-1 flex-col p-5">
        <h3 className="pointer-events-auto mb-2 line-clamp-2 text-base leading-tight font-semibold text-gray-900 transition-colors group-hover:text-orange-600 dark:text-white/90 dark:group-hover:text-orange-500">
          <Link href={`/dashboard/collections/${id}`}>{title}</Link>
        </h3>
        <p className="mb-4 line-clamp-2 flex-1 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
          {description}
        </p>

        <div className="pointer-events-auto mt-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              <Avatar className="h-6 w-6 border-2 border-white dark:border-gray-900">
                <AvatarImage src={ownerAvatar} alt={ownerName} />
                <AvatarFallback className="text-[10px] dark:bg-gray-800 dark:text-gray-300">
                  {ownerName[0]}
                </AvatarFallback>
              </Avatar>
              {extraContributors && (
                <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-[10px] font-medium text-gray-600 dark:border-gray-900 dark:bg-gray-800 dark:text-gray-400">
                  +{extraContributors}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-medium text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Layers className="h-3.5 w-3.5" />
              <span>{itemsCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              <span>
                {viewsCount > 999
                  ? (viewsCount / 1000).toFixed(1) + "k"
                  : viewsCount}
              </span>
            </div>
          </div>
        </div>

        <div className="pointer-events-auto mt-4 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-800">
          <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500">
            Updated {updatedAt}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-400">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-40 bg-white dark:border-gray-800 dark:bg-gray-900"
            >
              <DropdownMenuItem className="cursor-pointer dark:focus:bg-gray-800">
                Edit Details
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer dark:focus:bg-gray-800">
                Share
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-700 dark:focus:bg-gray-800">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

export function CreateCollectionCard({ onClick }: { onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group flex h-[340px] w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-6 text-center transition-all hover:border-orange-300 hover:bg-orange-50/50 dark:border-gray-800 dark:bg-gray-900/50 dark:hover:border-orange-500/50 dark:hover:bg-gray-800"
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-200 transition-all group-hover:bg-orange-100 group-hover:ring-orange-200 dark:bg-gray-800 dark:ring-gray-700 dark:group-hover:bg-gray-700">
        <Plus className="h-6 w-6 text-gray-400 group-hover:text-orange-600 dark:text-gray-500 dark:group-hover:text-orange-400" />
      </div>
      <h3 className="mb-1 text-base font-semibold text-gray-900 group-hover:text-orange-700 dark:text-white/90 dark:group-hover:text-orange-400">
        Create Collection
      </h3>
      <p className="text-sm text-gray-500 group-hover:text-orange-600/70 dark:text-gray-400 dark:group-hover:text-orange-500/70">
        Start from scratch or use a template
      </p>
    </button>
  );
}
