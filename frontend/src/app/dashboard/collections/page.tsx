"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteCollection } from "@/lib/collections";
import { CollectionGrid } from "@/components/collections/CollectionGrid";
import { CreateCollectionModal } from "@/components/collections/CreateCollectionModal";
import {
  CollectionCard,
  CollectionType,
  CreateCollectionCard,
} from "@/components/collections/CollectionCard";
import { handleApiError } from "@/lib/api-error-handler";
import { handleError } from "@/lib/handle-error";
import { CollectionsTabs } from "@/components/collections/CollectionsTabs";
import { CollectionsEmptyState } from "@/components/collections/CollectionsEmptyState";
import { Filter, Search } from "lucide-react";
import { useCollections } from "@/lib/collections";
import { CollectionModelType } from "@/types";
import { CollectionCardSkeleton } from "@/components/collections/CollectionCardSkeleton";
import { apiFetch, getUser } from "@/lib/auth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const TABS = ["All", "My Collections", "Saved", "Shared", "Marketplace"];

export default function CollectionsPage() {
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] =
    useState<CollectionModelType | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: collections = [], isLoading } = useCollections(activeTab);

  // Filter collections by search query
  const filteredCollections = collections.filter(
    (collection: CollectionModelType) =>
      collection.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleToggleSave = async (id: string) => {
    try {
      const res = await apiFetch(`/collections/${id}/save`, { method: "POST" });
      await handleApiError(res);
      const data = await res.json();
      toast.success(data.saved ? "Collection saved" : "Collection unsaved");
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    } catch (err) {
      handleError(err);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteCollection(deletingId);
      toast.success("Collection deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    } catch {
      toast.error("Failed to delete collection");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mx-auto flex h-full w-full max-w-7xl flex-col">
      <div className="mb-8">
        <h1 className="mb-2 text-[28px] font-bold tracking-tight text-gray-900 dark:text-white/90">
          Collections
        </h1>
        <p className="text-[15px] font-medium text-gray-500 dark:text-gray-400">
          Organize reusable quiz content and templates.
        </p>
      </div>

      <div className="mb-8 flex w-full flex-col justify-between gap-4 border-b border-gray-200 sm:flex-row sm:items-center dark:border-gray-800">
        <CollectionsTabs
          tabs={TABS}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          className="-mb-px border-none"
        />

        <div className="relative mb-3 flex shrink-0 items-center gap-2 sm:mb-0">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search collections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-lg border border-gray-200 bg-white pr-10 pl-9 text-sm text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none sm:w-64 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 dark:placeholder:text-gray-500"
            />
            <button className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400">
              <Filter className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <CollectionGrid>
          {[...Array(4)].map((_, i) => (
            <CollectionCardSkeleton key={i} />
          ))}
        </CollectionGrid>
      ) : collections.length > 0 ? (
        <CollectionGrid>
          {filteredCollections.map(
            (collection: import("@/types").CollectionModelType) => {
              const currentUser = getUser();
              const membership = collection.members?.find(
                (m: import("@/types").CollectionMemberModelType) =>
                  m.userId === currentUser?.id,
              );
              const isOwner = collection.ownerId === currentUser?.id;
              const userRole = isOwner ? "OWNER" : membership?.role || null;
              const isMember = membership?.status === "ACCEPTED";

              return (
                <CollectionCard
                  key={collection.id}
                  id={collection.id}
                  title={collection.title}
                  description={collection.description || ""}
                  type={collection.visibility as CollectionType}
                  ownerName={collection.owner?.name || "Unknown"}
                  ownerAvatar={
                    collection.owner?.avatar &&
                    typeof collection.owner.avatar === "object" &&
                    "url" in collection.owner.avatar
                      ? (collection.owner.avatar.url as string)
                      : undefined
                  }
                  itemsCount={collection._count?.items || 0}
                  viewsCount={collection.viewsCount}
                  updatedAt={new Date(
                    collection.updatedAt,
                  ).toLocaleDateString()}
                  extraContributors={Math.max(
                    0,
                    (collection._count?.members || 0) - 1,
                  )}
                  contentBadgeStr="Items"
                  canEdit={isOwner}
                  canShare={isOwner || userRole === "EDITOR"}
                  canDelete={isOwner}
                  canSave={
                    !isMember && !isOwner && collection.visibility === "PUBLIC"
                  }
                  onEdit={() => {
                    setEditingCollection(collection);
                    setIsCreateModalOpen(true);
                  }}
                  onDelete={() => setDeletingId(collection.id)}
                  onSave={() => handleToggleSave(collection.id)}
                />
              );
            },
          )}
          <CreateCollectionCard onClick={() => setIsCreateModalOpen(true)} />
        </CollectionGrid>
      ) : (
        <CollectionsEmptyState
          onCreateClick={() => setIsCreateModalOpen(true)}
        />
      )}

      <CreateCollectionModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingCollection(null);
        }}
        initialData={editingCollection}
        onSuccess={(collection) => {
          setIsCreateModalOpen(false);
          setEditingCollection(null);
          // Invalidate collections on both create and update
          queryClient.invalidateQueries({ queryKey: ["collections"] });

          if (!editingCollection) {
            router.push(`/dashboard/collections/${collection.id}`);
          } else {
            toast.success("Collection updated successfully");
          }
        }}
      />

      <AlertDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              collection and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
