"use client";

import { CollectionGrid } from "@/components/collections/CollectionGrid";
import { CollectionHeader } from "@/components/collections/CollectionHeader";
import {
  CollectionItemCard,
  CreateCollectionItemCard,
  ItemType,
} from "@/components/collections/CollectionItemCard";
import { CollectionsTabs } from "@/components/collections/CollectionsTabs";
import { CreateCollectionModal } from "@/components/collections/CreateCollectionModal";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { fetchCollection } from "@/lib/collections";
import { CollectionModelType } from "@/types";
import { apiFetch, getUser } from "@/lib/auth";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { handleError } from "@/lib/handle-error";
import { handleApiError } from "@/lib/api-error-handler";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Lock, UserMinus, LogOut, BookmarkMinus } from "lucide-react";

const TABS = ["All", "Templates", "Question Banks", "Settings"];

export default function CollectionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const collectionId = params.collectionId as string;
  const [activeTab, setActiveTab] = useState("All");
  const [collection, setCollection] = useState<
    | (CollectionModelType & {
        items?: import("@/types").CollectionItemModelType[];
      })
    | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCloning, setIsCloning] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const queryClient = useQueryClient();

  const refreshCollection = useCallback(() => {
    if (!collectionId) return;
    fetchCollection(collectionId)
      .then((data) => setCollection(data))
      .catch((err) => handleError(err))
      .finally(() => setIsLoading(false));
  }, [collectionId]);

  useEffect(() => {
    refreshCollection();
  }, [refreshCollection]);

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-200 border-t-orange-600 dark:border-orange-900/50 dark:border-t-orange-500" />
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="p-12 text-center font-medium text-gray-500 dark:text-gray-400">
        Collection not found
      </div>
    );
  }

  const handleUpdateSuccess = (updatedCollection: CollectionModelType) => {
    setCollection({ ...collection, ...updatedCollection });
    setIsEditModalOpen(false);
    queryClient.invalidateQueries({ queryKey: ["collections"] });
    toast.success("Collection updated successfully");
  };

  const currentUser = getUser();
  const membership = collection.members?.find(
    (m) => m.userId === currentUser?.id,
  );
  const isOwner = collection.ownerId === currentUser?.id;
  const userRole = isOwner ? "OWNER" : membership?.role || null;
  const userStatus = membership?.status || null;
  const isMember = userStatus === "ACCEPTED";
  const canEdit = isOwner || userRole === "EDITOR";
  const canManage = isOwner || userRole === "EDITOR";
  const isPrivate = collection.visibility === "PRIVATE";

  // Case 2: Private Collection, Non-member
  const shouldBlur = isPrivate && !isOwner && !isMember;

  const items = collection.items || [];

  const handleCloneQuiz = async (quizId: string) => {
    if (!quizId || isCloning) return;
    try {
      setIsCloning(true);
      toast.loading("Cloning template...", { id: "clone" });
      const res = await apiFetch(`/quiz/${quizId}/clone`, { method: "POST" });
      await handleApiError(res);
      const clonedQuiz = await res.json();
      toast.success("Template cloned successfully!", { id: "clone" });
      router.push(`/dashboard/quiz/${clonedQuiz.id}`);
    } catch (err) {
      toast.dismiss("clone");
      handleError(err);
    } finally {
      setIsCloning(false);
    }
  };

  const filteredItems = items.filter((item) => {
    if (activeTab === "All") return true;
    if (activeTab === "Templates" && item.type === "QUIZ_TEMPLATE") return true;
    if (activeTab === "Settings") return false; // Handled separately
    if (activeTab === "Question Banks" && item.type === "QUESTION_BANK")
      return true;
    return false;
  });

  const handleCreateItem = async (type: "QUIZ_TEMPLATE" | "QUESTION_BANK") => {
    if (isCreating) return;
    try {
      setIsCreating(true);
      toast.loading("Creating...", { id: "create-item" });

      const quizRes = await apiFetch("/quiz", {
        method: "POST",
        body: JSON.stringify({
          title:
            type === "QUIZ_TEMPLATE"
              ? "Untitled Template"
              : "Untitled Question Bank",
        }),
      });

      await handleApiError(quizRes);
      const newQuiz = await quizRes.json();

      const itemRes = await apiFetch(`/collections/${collectionId}/items`, {
        method: "POST",
        body: JSON.stringify({
          type,
          [type === "QUIZ_TEMPLATE" ? "quizId" : "bankId"]: newQuiz.id,
        }),
      });

      await handleApiError(itemRes);

      toast.success("Created successfully!", { id: "create-item" });
      router.push(`/dashboard/quiz/${newQuiz.id}`);
    } catch (err) {
      toast.dismiss("create-item");
      handleError(err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateRole = async () => {
    try {
      toast.loading("Updating role...", { id: "role" });
      toast.success("Role updated", { id: "role" });
      refreshCollection();
    } catch (err) {
      handleError(err);
    }
  };

  const handleRemoveMember = async () => {
    if (!confirm("Are you sure you want to remove this collaborator?")) return;
    try {
      toast.loading("Removing member...", { id: "remove" });
      toast.success("Member removed", { id: "remove" });
      refreshCollection();
    } catch (err) {
      handleError(err);
    }
  };

  const handleToggleSave = async () => {
    try {
      const res = await apiFetch(`/collections/${collectionId}/save`, {
        method: "POST",
      });
      await handleApiError(res);
      const data = await res.json();
      toast.success(data.saved ? "Collection saved" : "Collection unsaved");
      refreshCollection();
    } catch (err) {
      handleError(err);
    }
  };

  const handleJoin = async () => {
    try {
      toast.loading("Sending request...", { id: "join" });
      const res = await apiFetch(`/collections/${collectionId}/join`, {
        method: "POST",
      });
      await handleApiError(res);
      toast.success("Request sent successfully", { id: "join" });
      refreshCollection();
    } catch (err) {
      handleError(err);
    }
  };

  const handleOptOut = async () => {
    if (!confirm("Are you sure you want to opt out?")) return;
    try {
      toast.loading("Opting out...", { id: "opt-out" });
      const res = await apiFetch(`/collections/${collectionId}/opt-out`, {
        method: "POST",
      });
      await handleApiError(res);
      toast.success("Opted out successfully", { id: "opt-out" });
      router.push("/dashboard/collections");
    } catch (err) {
      handleError(err);
    }
  };

  const menuActionsForItem = (
    item: import("@/types").CollectionItemModelType,
  ) => {
    const actions = [];
    if (canEdit) {
      actions.push({
        label: "Edit",
        onClick: () =>
          router.push(`/dashboard/quiz/${item.quizId || item.bankId}`),
      });
    }
    actions.push({
      label: "Export",
      onClick: () => {
        /* export logic */
      },
    });
    if (isOwner) {
      actions.push({
        label: "Delete",
        onClick: () => {
          /* delete logic */
        },
        destructive: true,
      });
    }
    return actions;
  };

  return (
    <div className="mx-auto flex h-full w-full max-w-7xl flex-col">
      {/* Breadcrumb and Top Actions */}
      <div className="mb-4 flex flex-col justify-between gap-4 border-b border-gray-100 pb-4 sm:flex-row sm:items-center dark:border-gray-800">
        <div className="flex items-center gap-2 text-[15px]">
          <Link
            href="/dashboard/collections"
            className="font-medium text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            Collections
          </Link>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {collection.title}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden md:block">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search collection items..."
              className="h-10 w-64 rounded-full border border-transparent bg-gray-100/80 pr-4 pl-9 text-sm text-gray-900 transition-colors placeholder:text-gray-500 focus:border-orange-500 focus:bg-white focus:ring-1 focus:ring-orange-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-orange-500 dark:focus:bg-gray-900"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                disabled={isCreating}
                className="h-10 gap-2 rounded-full bg-orange-600 px-5 text-[14px] font-bold text-white shadow-sm hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-500"
              >
                <Plus className="h-4 w-4" />
                New Item
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 font-medium text-gray-700 dark:border-gray-800 dark:bg-gray-900"
            >
              <DropdownMenuItem
                className="cursor-pointer py-3 dark:text-gray-300 dark:focus:bg-gray-800 dark:focus:text-white"
                onClick={() => handleCreateItem("QUIZ_TEMPLATE")}
              >
                Create Quiz Template
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer py-3 dark:text-gray-300 dark:focus:bg-gray-800 dark:focus:text-white"
                onClick={() => handleCreateItem("QUESTION_BANK")}
              >
                Create Question Bank
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <CollectionHeader
        title={collection.title}
        description={collection.description || ""}
        thumbnail={
          collection.coverImage ||
          "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80"
        }
        type={
          collection.visibility as "TEMPLATE" | "BANK" | "PRIVATE" | "PUBLIC"
        }
        ownerName={collection.owner?.name || "Unknown"}
        ownerAvatar={
          collection.owner?.avatar &&
          typeof collection.owner.avatar === "object" &&
          "url" in collection.owner.avatar
            ? (collection.owner.avatar.url as string)
            : undefined
        }
        itemsCount={collection._count?.items || collection.itemsCount}
        viewsCount={collection.viewsCount}
        updatedAt={new Date(collection.updatedAt).toLocaleDateString()}
        onEdit={() => setIsEditModalOpen(true)}
        canEdit={canEdit}
        canShare={isMember || isOwner || collection.visibility === "PUBLIC"}
        showJoinButton={!isMember && !isOwner}
        onJoin={handleJoin}
        joinButtonText={
          userStatus === "PENDING_INVITE"
            ? "Accept Invitation"
            : userStatus === "PENDING_REQUEST"
              ? "Request Sent"
              : "Join Collection"
        }
      />

      {/* Tabs */}
      <div className="mb-8 border-b border-gray-200">
        <CollectionsTabs
          tabs={TABS}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          className="mb-[-1px] w-auto max-w-md border-none"
        />
      </div>

      {/* Items Grid / Settings View */}
      {activeTab === "Settings" ? (
        <div className="space-y-8">
          <section>
            <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
              Collaborators
            </h3>
            <div className="rounded-xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-100 hover:bg-transparent dark:border-gray-800">
                    <TableCell isHeader className="w-[80px]">
                      Avatar
                    </TableCell>
                    <TableCell isHeader>Name</TableCell>
                    <TableCell isHeader>Role</TableCell>
                    {(canManage || isOwner) && (
                      <TableCell isHeader className="text-right">
                        Actions
                      </TableCell>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {collection.members?.map(
                    (member: import("@/types").CollectionMemberModelType) => (
                      <TableRow
                        key={member.id}
                        className="border-gray-100 dark:border-gray-800"
                      >
                        <TableCell>
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={member.user?.avatar?.url} />
                            <AvatarFallback>
                              {member.user?.name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                        </TableCell>
                        <TableCell className="font-medium text-gray-900 dark:text-gray-200">
                          {member.user?.name}
                        </TableCell>
                        <TableCell>
                          {isOwner && member.userId !== currentUser?.id ? (
                            <select
                              value={member.role}
                              className="h-8 w-32 rounded-md border border-gray-100 bg-gray-50 px-2 text-[13px] dark:border-gray-800 dark:bg-gray-800"
                              onChange={() => handleUpdateRole()}
                            >
                              <option value="EDITOR">Editor</option>
                              <option value="VIEWER">Viewer</option>
                            </select>
                          ) : (
                            <Badge
                              variant="secondary"
                              className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                            >
                              {member.role === "OWNER"
                                ? "Owner"
                                : member.role === "EDITOR"
                                  ? "Editor"
                                  : "Viewer"}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {isOwner && member.userId !== currentUser?.id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
                              onClick={() => handleRemoveMember()}
                            >
                              <UserMinus className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ),
                  )}
                </TableBody>
              </Table>
            </div>
          </section>

          <section className="flex flex-wrap gap-4 pt-4">
            {/* Unsave button if saved */}
            <Button
              variant="outline"
              onClick={handleToggleSave}
              className="gap-2 border-red-100 text-red-600 hover:bg-red-50 dark:border-red-500/20 dark:hover:bg-red-500/10"
            >
              <BookmarkMinus className="h-4 w-4" />
              Unsave Collection
            </Button>

            {/* Opt out button if not owner but collaborator */}
            {!isOwner && isMember && (
              <Button
                variant="outline"
                onClick={handleOptOut}
                className="gap-2 border-red-100 text-red-600 hover:bg-red-50 dark:border-red-500/20 dark:hover:bg-red-500/10"
              >
                <LogOut className="h-4 w-4" />
                Opt out from collaborator
              </Button>
            )}
          </section>
        </div>
      ) : (
        <div className="relative">
          {shouldBlur && (
            <div className="absolute inset-x-0 top-0 z-10 flex h-[400px] flex-col items-center justify-center rounded-2xl bg-white/40 backdrop-blur-md dark:bg-black/40">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-500/20">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                Private Collection
              </h3>
              <p className="mb-6 max-w-sm text-center text-[15px] font-medium text-gray-600 dark:text-gray-400">
                This collection is private. You must be invited to view its
                content.
              </p>
              <Button
                onClick={handleJoin}
                className="rounded-full bg-orange-600 px-8 font-bold text-white shadow-lg hover:bg-orange-700"
              >
                Join Collection
              </Button>
            </div>
          )}
          <div
            className={
              shouldBlur ? "pointer-events-none blur-sm select-none" : ""
            }
          >
            <CollectionGrid>
              {filteredItems.map((item) => {
                const isTemplate = item.type === "QUIZ_TEMPLATE";
                const ref = isTemplate ? item.quiz : item.bank;
                const questionsCount = ref?.questions?.length || 0;
                return (
                  <CollectionItemCard
                    key={item.id}
                    id={item.id}
                    title={ref?.title || "Untitled"}
                    type={item.type as ItemType}
                    questionsCount={questionsCount}
                    thumbnail={ref?.coverImage || undefined}
                    updatedAt={new Date(item.updatedAt).toLocaleDateString()}
                    menuActions={menuActionsForItem(item)}
                    primaryActionLabel={
                      isTemplate ? "Clone to My Quizzes" : "Extract Questions"
                    }
                    onPrimaryAction={() =>
                      isTemplate && ref?.id ? handleCloneQuiz(ref.id) : null
                    }
                  />
                );
              })}
              {canEdit && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="h-full cursor-pointer">
                      <CreateCollectionItemCard />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="center"
                    className="w-56 font-medium text-gray-700"
                  >
                    <DropdownMenuItem
                      className="cursor-pointer py-3"
                      onClick={() => handleCreateItem("QUIZ_TEMPLATE")}
                    >
                      Create Quiz Template
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer py-3"
                      onClick={() => handleCreateItem("QUESTION_BANK")}
                    >
                      Create Question Bank
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </CollectionGrid>
          </div>
        </div>
      )}

      <CreateCollectionModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialData={collection}
        onSuccess={handleUpdateSuccess}
      />
    </div>
  );
}
