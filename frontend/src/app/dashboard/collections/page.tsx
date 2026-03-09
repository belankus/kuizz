"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CollectionGrid } from "@/components/collections/CollectionGrid";
import { CreateCollectionModal } from "@/components/collections/CreateCollectionModal";
import {
  CollectionCard,
  CollectionType,
  CreateCollectionCard,
} from "@/components/collections/CollectionCard";
import { CollectionsTabs } from "@/components/collections/CollectionsTabs";
import { CollectionsEmptyState } from "@/components/collections/CollectionsEmptyState";
import { Filter, Search } from "lucide-react";
import { fetchCollections } from "@/lib/collections";
import { CollectionModelType } from "@/types";

const TABS = ["All", "My Collections", "Saved", "Shared", "Marketplace"];

export default function CollectionsPage() {
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [collections, setCollections] = useState<CollectionModelType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchCollections()
      .then((data) => {
        setCollections(data);
      })
      .catch((err) => console.error("Failed to fetch collections", err))
      .finally(() => setIsLoading(false));
  }, []);

  // Filter collections by tab
  const filteredCollections = collections
    .filter((collection) => {
      // Logic would be better backed by API mapping, but doing it in memory since fetchCollections returns all right now
      if (activeTab === "All") return true;
      if (activeTab === "Shared" && collection.visibility === "SHARED")
        return true;
      if (activeTab === "Marketplace" && collection.visibility === "PUBLIC")
        return true;
      if (activeTab === "My Collections") return true; // Could filter by ownerId if we had it in context
      if (activeTab === "Saved") return false; // Usually we fetch from /collections/saved
      return true;
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

      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-200 border-t-orange-600" />
        </div>
      ) : collections.length > 0 ? (
        <CollectionGrid>
          {filteredCollections.map((collection) => (
            <CollectionCard
              key={collection.id}
              id={collection.id}
              title={collection.title}
              description={collection.description || ""}
              type={collection.visibility as CollectionType}
              ownerName={collection.owner?.name || "Unknown"}
              ownerAvatar={collection.owner?.avatar?.url}
              itemsCount={collection._count?.items || 0}
              viewsCount={collection.viewsCount}
              updatedAt={new Date(collection.updatedAt).toLocaleDateString()}
              extraContributors={Math.max(
                0,
                (collection._count?.members || 0) - 1,
              )}
              contentBadgeStr="Items"
            />
          ))}
          <CreateCollectionCard onClick={() => setIsCreateModalOpen(true)} />
        </CollectionGrid>
      ) : (
        <CollectionsEmptyState
          onCreateClick={() => setIsCreateModalOpen(true)}
        />
      )}

      <CreateCollectionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={(newCollection) => {
          setCollections([newCollection, ...collections]);
          setIsCreateModalOpen(false);
          router.push(`/dashboard/collections/${newCollection.id}`);
        }}
      />
    </div>
  );
}
