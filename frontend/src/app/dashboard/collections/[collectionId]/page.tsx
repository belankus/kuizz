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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchCollection } from "@/lib/collections";
import { CollectionModelType } from "@/types";
import { apiFetch } from "@/lib/auth";
import { toast } from "sonner";
import { handleError } from "@/lib/handle-error";
import { handleApiError } from "@/lib/api-error-handler";

const TABS = ["All", "Templates", "Question Banks"];

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

  useEffect(() => {
    if (!collectionId) return;
    fetchCollection(collectionId)
      .then((data) => setCollection(data))
      .catch((err) => handleError(err))
      .finally(() => setIsLoading(false));
  }, [collectionId]);

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

  const items = collection.items || [];
  const filteredItems = items.filter((item) => {
    if (activeTab === "All") return true;
    if (activeTab === "Templates" && item.type === "QUIZ_TEMPLATE") return true;
    if (activeTab === "Question Banks" && item.type === "QUESTION_BANK")
      return true;
    return false;
  });

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

      {/* Collection Header Details */}
      <CollectionHeader
        title={collection.title}
        description={collection.description || ""}
        thumbnail={
          collection.coverImage ||
          "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80"
        }
        type={
          collection.visibility as
            | "TEMPLATE"
            | "BANK"
            | "PRIVATE"
            | "SHARED"
            | "PUBLIC"
        }
        ownerName={collection.owner?.name || "Unknown"}
        ownerAvatar={collection.owner?.avatar?.url}
        itemsCount={collection._count?.items || collection.itemsCount}
        viewsCount={collection.viewsCount}
        updatedAt={new Date(collection.updatedAt).toLocaleDateString()}
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

      {/* Items Grid */}
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
              primaryActionLabel={
                isTemplate ? "Clone to My Quizzes" : "Extract Questions"
              }
              onPrimaryAction={() =>
                isTemplate ? handleCloneQuiz(ref?.id) : null
              }
            />
          );
        })}
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
      </CollectionGrid>
    </div>
  );
}
