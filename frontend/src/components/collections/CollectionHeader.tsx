import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Edit2, Eye, Layers, Share2 } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

export interface CollectionHeaderProps {
  title: string;
  description: string;
  thumbnail: string;
  type: string;
  ownerName: string;
  ownerAvatar?: string;
  itemsCount: number;
  viewsCount: number;
  updatedAt: string;
}

export function CollectionHeader({
  title,
  description,
  thumbnail,
  type,
  ownerName,
  ownerAvatar,
  itemsCount,
  viewsCount,
  updatedAt,
}: CollectionHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-8 pt-4 md:flex-row md:items-start">
      {/* Cover */}
      <div className="relative h-[220px] w-[220px] shrink-0 overflow-hidden rounded-2xl bg-emerald-700 shadow-sm ring-1 ring-gray-200">
        {thumbnail.startsWith("http") || thumbnail.startsWith("/") ? (
          <Image src={thumbnail} alt={title} fill className="object-cover" />
        ) : null}
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col pt-1">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <h1 className="text-[28px] leading-none font-bold tracking-tight text-gray-900">
                {title}
              </h1>
              <Badge
                variant="secondary"
                className="mt-1 bg-green-100 px-2 py-0.5 text-[10px] font-bold tracking-widest text-green-700 uppercase hover:bg-green-200"
              >
                {type}
              </Badge>
            </div>
            <p className="mb-6 max-w-2xl text-[15px] leading-relaxed font-medium text-gray-600">
              {description}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <Button
              variant="outline"
              className="h-10 cursor-pointer gap-2 rounded-full border-gray-200 bg-white px-5 font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-900"
            >
              <Share2 className="h-4 w-4 text-gray-500" />
              Share
            </Button>
            <Button
              variant="outline"
              className="h-10 cursor-pointer gap-2 rounded-full border-orange-200 bg-orange-50 px-5 font-semibold text-orange-700 shadow-sm transition-colors hover:bg-orange-100"
            >
              <Edit2 className="h-4 w-4 text-orange-500" />
              Edit Details
            </Button>
          </div>
        </div>

        <div className="mt-8 flex items-center gap-6 border-t border-gray-100 pt-6 text-[13px] font-semibold text-gray-500">
          <div className="flex items-center gap-2.5">
            <Avatar className="h-7 w-7 border border-gray-200">
              <AvatarImage src={ownerAvatar} alt={ownerName} />
              <AvatarFallback className="bg-gray-100 text-[10px] font-bold text-gray-600">
                {ownerName[0]}
              </AvatarFallback>
            </Avatar>
            <span className="text-gray-900">{ownerName}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Layers className="h-4 w-4 text-gray-400" />
            <span>{itemsCount} items</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Eye className="h-4 w-4 text-gray-400" />
            <span>
              {viewsCount > 999
                ? (viewsCount / 1000).toFixed(1) + "k"
                : viewsCount}{" "}
              views
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-gray-400">
            <span>Updated {updatedAt}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
