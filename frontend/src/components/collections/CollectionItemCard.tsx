import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit2, FileText, Layers, MoreVertical, Plus } from "lucide-react";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { CollectionItemType, QuizStatus } from "@/types";

export type ItemType = CollectionItemType | QuizStatus | "PDF" | "VIDEO";

export interface CollectionItemCardProps {
  id: string;
  title: string;
  type: ItemType;
  questionsCount?: number;
  itemsCount?: number;
  thumbnail?: string | null;
  updatedAt?: string;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  secondaryActionLabel?: React.ReactNode;
  onSecondaryAction?: () => void;
  onClick?: () => void;
  menuActions?: { label: string; onClick: () => void; destructive?: boolean }[];
}

export function CollectionItemCard({
  title,
  type,
  questionsCount,
  itemsCount,
  thumbnail,
  updatedAt,
  primaryActionLabel = "Add to Quiz",
  onPrimaryAction,
  secondaryActionLabel,
  onSecondaryAction,
  onClick,
  menuActions,
}: CollectionItemCardProps) {
  const isPublished = type === "PUBLISHED";
  const displayType = type.replace("_", " ");

  const defaultSecondaryIcon = <Edit2 className="h-4 w-4" />;

  return (
    <div
      onClick={onClick}
      className={`group flex h-[320px] flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 transition-all hover:shadow-md dark:bg-gray-900/50 dark:ring-gray-800 ${onClick ? "cursor-pointer" : ""}`}
    >
      {/* Thumbnail */}
      <div
        className={`relative h-[160px] w-full shrink-0 border-b border-gray-100 dark:border-gray-800 ${isPublished ? "bg-[#E6F3EF] dark:bg-[#1A2F25]" : "bg-slate-100 dark:bg-gray-800"}`}
      >
        {thumbnail ? (
          <Image src={thumbnail} alt={title} fill className="object-cover" />
        ) : isPublished ? (
          <svg
            className="absolute -right-10 -bottom-10 h-[150%] w-[150%] text-[#a8e6cf] opacity-50 dark:opacity-20"
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="currentColor"
              d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.6,90,-16.3,88.5,-0.9C87,14.6,81.4,29.1,72.4,41.2C63.4,53.2,50.8,62.7,37.1,69.5C23.4,76.3,8.6,80.3,-6.1,79.8C-20.8,79.3,-35.4,74.3,-48.5,66.1C-61.6,57.9,-73.2,46.3,-80.6,32.3C-88,18.3,-91.2,1.9,-87.3,-13.1C-83.3,-28.1,-72.2,-41.8,-58.9,-51.2C-45.6,-60.7,-30.1,-66,-15.5,-73.1C-1,-80.1,13.4,-89,28.5,-87C43.6,-85.1,30.6,-83.6,44.7,-76.4Z"
              transform="translate(100 100)"
            />
          </svg>
        ) : null}
        <div className="absolute top-3 left-3 flex w-full justify-between pr-6">
          <Badge
            variant="secondary"
            className="border border-gray-100 bg-white text-[10px] font-bold tracking-wider text-gray-800 uppercase shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            {displayType}
          </Badge>
          {questionsCount !== undefined && type === "PUBLISHED" && (
            <div className="rounded-md bg-[#4B5563] px-3 py-1 text-xs font-bold text-white shadow-sm dark:bg-gray-700">
              {questionsCount} Qs
            </div>
          )}
        </div>
      </div>

      <div className="z-10 flex flex-1 flex-col bg-white p-4 dark:bg-transparent">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-[15px] leading-tight font-bold text-gray-900 transition-colors group-hover:text-orange-600 dark:text-white/90 dark:group-hover:text-orange-500">
            {title}
          </h3>
          {menuActions && menuActions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="-mt-1 -mr-1 shrink-0 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                >
                  <MoreVertical className="h-[18px] w-[18px]" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-40 bg-white dark:border-gray-800 dark:bg-gray-900"
              >
                {menuActions.map((action, i) => (
                  <DropdownMenuItem
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation();
                      action.onClick();
                    }}
                    className={`cursor-pointer dark:focus:bg-gray-800 dark:focus:text-white ${action.destructive ? "text-red-600 focus:text-red-700 dark:text-red-400 dark:focus:text-red-300" : "dark:text-gray-300"}`}
                  >
                    {action.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="mt-1 mb-auto flex flex-col gap-1 text-xs font-medium text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1.5">
            {questionsCount !== undefined && type !== "PUBLISHED" ? (
              <>
                <FileText className="h-3.5 w-3.5 text-gray-400" />
                <span>{questionsCount} Questions</span>
              </>
            ) : itemsCount !== undefined ? (
              <>
                <Layers className="h-3.5 w-3.5 text-gray-400" />
                <span>{itemsCount} Items</span>
              </>
            ) : null}
          </div>
          {updatedAt && (
            <span className="mt-1 text-[11px] text-gray-400 dark:text-gray-500">
              Updated {updatedAt}
            </span>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between gap-2">
          {primaryActionLabel && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onPrimaryAction?.();
              }}
              className="h-10 flex-1 rounded-[10px] bg-[#e54d1f] text-sm font-semibold text-white shadow-sm hover:bg-[#b23c18] dark:bg-orange-500 dark:hover:bg-orange-600"
              size="sm"
            >
              {primaryActionLabel}
            </Button>
          )}
          {secondaryActionLabel !== null && (
            <Button
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onSecondaryAction?.();
              }}
              className={
                typeof secondaryActionLabel === "string"
                  ? "h-10 flex-1 rounded-[10px] border-gray-200 bg-white text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  : "h-10 w-10 shrink-0 rounded-[10px] border-gray-200 p-0 text-gray-500 hover:text-gray-900 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
              }
              size={typeof secondaryActionLabel === "string" ? "sm" : "icon"}
            >
              {secondaryActionLabel || defaultSecondaryIcon}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function CreateCollectionItemCard() {
  return (
    <button className="group flex h-[300px] w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-6 text-center transition-all hover:border-orange-300 hover:bg-orange-50/50 dark:border-gray-800 dark:bg-gray-900/30 dark:hover:border-orange-500/50 dark:hover:bg-orange-500/10">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-200 transition-all group-hover:bg-orange-100 group-hover:ring-orange-200 dark:bg-gray-800 dark:ring-gray-700 dark:group-hover:bg-orange-500/20 dark:group-hover:ring-orange-500/30">
        <Plus className="h-6 w-6 text-gray-400 group-hover:text-orange-600 dark:text-gray-500 dark:group-hover:text-orange-400" />
      </div>
      <h3 className="mb-1 text-base font-semibold text-gray-900 group-hover:text-orange-700 dark:text-white/90 dark:group-hover:text-orange-400">
        New Item
      </h3>
      <p className="text-sm text-gray-500 group-hover:text-orange-600/70 dark:text-gray-400 dark:group-hover:text-orange-400/80">
        Add a template or bank
      </p>
    </button>
  );
}
