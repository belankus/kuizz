"use client";

import { useState } from "react";
import { CollectionGrid } from "@/components/collections/CollectionGrid";
import {
  CollectionCard,
  CollectionType,
  CreateCollectionCard,
} from "@/components/collections/CollectionCard";
import { CollectionsTabs } from "@/components/collections/CollectionsTabs";
import { CollectionsEmptyState } from "@/components/collections/CollectionsEmptyState";
import { Filter, Search } from "lucide-react";

const MOCK_COLLECTIONS = [
  {
    id: "c1",
    title: "Computer Science Fundamentals",
    description: "Standardized questions for entry-level engineering...",
    type: "TEMPLATE" as CollectionType,
    ownerName: "Alice",
    ownerAvatar: "https://i.pravatar.cc/150?u=alice",
    itemsCount: 24,
    viewsCount: 1200,
    updatedAt: "2h ago",
    extraContributors: 3,
  },
  {
    id: "c2",
    title: "Marketing Strategy 101",
    description: "Core concepts of digital marketing and brand...",
    type: "BANK" as CollectionType,
    ownerName: "Bob",
    ownerAvatar: "https://i.pravatar.cc/150?u=bob",
    itemsCount: 45,
    viewsCount: 842,
    updatedAt: "1d ago",
  },
  {
    id: "c3",
    title: "Global History Quiz Bank",
    description: "Questions covering major historical events from 1900 to...",
    type: "SHARED" as CollectionType,
    ownerName: "Charlie",
    ownerAvatar: "https://i.pravatar.cc/150?u=charlie",
    itemsCount: 120,
    viewsCount: 3100,
    updatedAt: "3d ago",
  },
  {
    id: "c4",
    title: "UX Design Challenges",
    description: "Creative problem-solving scenarios for senior UX roles.",
    type: "PRIVATE" as CollectionType,
    ownerName: "Dave",
    ownerAvatar: "https://i.pravatar.cc/150?u=dave",
    itemsCount: 12,
    viewsCount: 124,
    updatedAt: "5h ago",
  },
  {
    id: "c5",
    title: "Language Proficiency A1",
    description: "Grammar and vocabulary basics for beginners.",
    type: "NEW" as CollectionType,
    ownerName: "Eve",
    ownerAvatar: "https://i.pravatar.cc/150?u=eve",
    itemsCount: 60,
    viewsCount: 210,
    updatedAt: "10m ago",
  },
];

const TABS = ["All", "Templates", "Question Banks", "My Collections", "Shared"];

export default function CollectionsPage() {
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Example state for empty toggling (for testing UI purposes if needed)
  const [isEmpty, setIsEmpty] = useState(false);

  const collections = isEmpty ? [] : MOCK_COLLECTIONS;

  // Filter collections by tab
  const filteredCollections = collections
    .filter((collection) => {
      if (activeTab === "All") return true;
      if (activeTab === "Templates" && collection.type === "TEMPLATE")
        return true;
      if (activeTab === "Question Banks" && collection.type === "BANK")
        return true;
      if (activeTab === "Shared" && collection.type === "SHARED") return true;
      if (activeTab === "My Collections" && collection.type === "PRIVATE")
        return true;
      return false;
    })
    .filter((collection) =>
      collection.title.toLowerCase().includes(searchQuery.toLowerCase()),
    );

  return (
    <div className="mx-auto flex h-full w-full max-w-7xl flex-col">
      <div className="mb-8">
        <h1 className="mb-2 text-[28px] font-bold tracking-tight text-gray-900">
          Collections
        </h1>
        <p className="text-[15px] font-medium text-gray-500">
          Organize reusable quiz content and templates.
        </p>
      </div>

      <div className="mb-8 flex w-full flex-col justify-between gap-4 border-b border-gray-200 sm:flex-row sm:items-center">
        <CollectionsTabs
          tabs={TABS}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          className="mb-[-1px] border-none"
        />

        <div className="relative mb-3 flex shrink-0 items-center gap-2 sm:mb-0">
          {/* Dev-only toggle for empty state testing */}
          <button
            onClick={() => setIsEmpty(!isEmpty)}
            className="mr-2 text-xs text-gray-400 underline hover:text-orange-500"
          >
            Toggle Empty
          </button>

          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search collections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-lg border border-gray-200 bg-white pr-10 pl-9 text-sm text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none sm:w-64"
            />
            <button className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <Filter className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {collections.length > 0 ? (
        <CollectionGrid>
          {filteredCollections.map((collection) => (
            <CollectionCard key={collection.id} {...collection} />
          ))}
          <CreateCollectionCard />
        </CollectionGrid>
      ) : (
        <CollectionsEmptyState />
      )}
    </div>
  );
}
