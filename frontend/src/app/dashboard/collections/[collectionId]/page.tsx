"use client";

import { CollectionGrid } from "@/components/collections/CollectionGrid";
import { CollectionHeader } from "@/components/collections/CollectionHeader";
import {
  CollectionItemCard,
  CreateCollectionItemCard,
  ItemType,
} from "@/components/collections/CollectionItemCard";
import { CollectionsTabs } from "@/components/collections/CollectionsTabs";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import React from "react";

const MOCK_COLLECTION_DETAILS = {
  title: "Geography Basics",
  description:
    "A comprehensive collection covering world capitals, major landforms, and global climate patterns. Designed for middle school level introductory geography.",
  thumbnail:
    "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80",
  type: "PUBLIC",
  ownerName: "Alex Morgan",
  ownerAvatar: "https://i.pravatar.cc/150?u=alex",
  itemsCount: 12,
  viewsCount: 428,
  updatedAt: "2 days ago",
};

const MOCK_ITEMS = [
  {
    id: "i1",
    title: "World Capitals & Cities",
    type: "QUIZ TEMPLATE" as ItemType,
    questionsCount: 25,
    thumbnail:
      "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80",
  },
  {
    id: "i2",
    title: "Geological Formations",
    type: "QUESTION BANK" as ItemType,
    itemsCount: 112,
    thumbnail:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80",
  },
  {
    id: "i3",
    title: "Climate Zones & Patterns",
    type: "QUIZ TEMPLATE" as ItemType,
    questionsCount: 15,
    thumbnail:
      "https://images.unsplash.com/photo-1561484930-998b6a7b22e8?w=800&q=80",
  },
  {
    id: "i4",
    title: "Map Projections & Scales",
    type: "QUESTION BANK" as ItemType,
    itemsCount: 48,
    thumbnail:
      "https://images.unsplash.com/photo-1526778548025-fa2fbf128120?w=800&q=80",
  },
];

const TABS = ["Items", "Analytics", "Settings"];

// Since this page uses params, we unwrap them for Next.js app router 15
export default function CollectionDetailPage() {
  const [activeTab, setActiveTab] = useState("Items");

  return (
    <div className="mx-auto flex h-full w-full max-w-7xl flex-col">
      {/* Breadcrumb and Top Actions */}
      <div className="mb-4 flex flex-col justify-between gap-4 border-b border-gray-100 pb-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2 text-[15px]">
          <Link
            href="/dashboard/collections"
            className="font-medium text-gray-500 transition-colors hover:text-gray-900"
          >
            Collections
          </Link>
          <span className="text-gray-300">/</span>
          <span className="font-semibold text-gray-900">
            {MOCK_COLLECTION_DETAILS.title}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden md:block">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search collection items..."
              className="h-10 w-64 rounded-full border-transparent bg-gray-100/80 pr-4 pl-9 text-sm text-gray-900 transition-colors placeholder:text-gray-500 focus:border-orange-500 focus:bg-white focus:ring-1 focus:ring-orange-500 focus:outline-none"
            />
          </div>
          <Button className="h-10 gap-2 rounded-full bg-orange-600 px-5 text-[14px] font-bold text-white shadow-sm hover:bg-orange-700">
            <Plus className="h-4 w-4" />
            New Item
          </Button>
        </div>
      </div>

      {/* Collection Header Details */}
      <CollectionHeader {...MOCK_COLLECTION_DETAILS} />

      {/* Tabs */}
      <div className="mb-8 border-b border-gray-200">
        <CollectionsTabs
          tabs={TABS}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          className="mb-[-1px] w-auto max-w-md border-none"
        />
      </div>

      {/* Items Grid */}
      {activeTab === "Items" && (
        <CollectionGrid>
          {MOCK_ITEMS.map((item) => (
            <CollectionItemCard key={item.id} {...item} />
          ))}
          <CreateCollectionItemCard />
        </CollectionGrid>
      )}

      {/* Other Tabs Content */}
      {activeTab === "Analytics" && (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center font-medium text-gray-500">
          Analytics view coming soon
        </div>
      )}

      {activeTab === "Settings" && (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center font-medium text-gray-500">
          Settings view coming soon
        </div>
      )}
    </div>
  );
}
