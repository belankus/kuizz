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

export type ItemType = "QUIZ TEMPLATE" | "QUESTION BANK" | "PDF" | "VIDEO";

export interface CollectionItemCardProps {
  id: string;
  title: string;
  type: ItemType;
  questionsCount?: number;
  itemsCount?: number;
  thumbnail: string;
}

export function CollectionItemCard({
  title,
  type,
  questionsCount,
  itemsCount,
  thumbnail,
}: CollectionItemCardProps) {
  return (
    <div className="group flex h-[300px] flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 transition-all hover:shadow-md">
      {/* Thumbnail */}
      <div className="relative h-[160px] w-full shrink-0 border-b border-gray-100 bg-slate-100">
        <Image src={thumbnail} alt={title} fill className="object-cover" />
        <div className="absolute top-3 left-3">
          <Badge
            variant="secondary"
            className="border border-gray-100 bg-white text-[10px] font-bold tracking-wider text-gray-800 uppercase shadow-sm hover:bg-gray-50"
          >
            {type}
          </Badge>
        </div>
      </div>

      <div className="z-10 flex flex-1 flex-col bg-white p-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-[15px] leading-tight font-bold text-gray-900 transition-colors group-hover:text-orange-600">
            {title}
          </h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="-mt-1 -mr-1 shrink-0 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600">
                <MoreVertical className="h-[18px] w-[18px]" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 bg-white">
              <DropdownMenuItem className="cursor-pointer">
                Move
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-700">
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-1 mb-auto flex items-center gap-1.5 text-xs font-medium text-gray-500">
          {questionsCount !== undefined ? (
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

        <div className="mt-4 flex items-center justify-between gap-2">
          <Button
            className="h-10 flex-1 rounded-[10px] bg-orange-600 text-sm font-semibold text-white shadow-sm hover:bg-orange-700"
            size="sm"
          >
            Add to Quiz
          </Button>
          <Button
            variant="outline"
            className="h-10 w-10 shrink-0 rounded-[10px] border-gray-200 p-0 text-gray-500 hover:text-gray-900"
            size="icon"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function CreateCollectionItemCard() {
  return (
    <button className="group flex h-[300px] w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-6 text-center transition-all hover:border-orange-300 hover:bg-orange-50/50">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-200 transition-all group-hover:bg-orange-100 group-hover:ring-orange-200">
        <Plus className="h-6 w-6 text-gray-400 group-hover:text-orange-600" />
      </div>
      <h3 className="mb-1 text-base font-semibold text-gray-900 group-hover:text-orange-700">
        New Item
      </h3>
      <p className="text-sm text-gray-500 group-hover:text-orange-600/70">
        Add a template or bank
      </p>
    </button>
  );
}
