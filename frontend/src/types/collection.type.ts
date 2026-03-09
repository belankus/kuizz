export type CollectionVisibility = "PRIVATE" | "SHARED" | "PUBLIC";
export type CollectionItemType = "QUIZ_TEMPLATE" | "QUESTION_BANK";
export type CollectionRole = "OWNER" | "EDITOR" | "VIEWER";

export interface CollectionModelType {
  id: string;
  title: string;
  description: string | null;
  coverImage: string | null;
  visibility: CollectionVisibility;
  itemsCount: number;
  viewsCount: number;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  owner?: {
    name: string | null;
    avatar: unknown;
  };
  _count?: {
    items: number;
    members: number;
  };
}

export interface CollectionItemModelType {
  id: string;
  collectionId: string;
  type: CollectionItemType;
  quizId: string | null;
  bankId: string | null;
  createdAt: string;
  updatedAt: string;
  quiz?: unknown; // You can refine this using QuizModelType
  bank?: unknown; // You can refine this using QuizModelType
}

export interface CollectionMemberModelType {
  id: string;
  collectionId: string;
  userId: string;
  role: CollectionRole;
  createdAt: string;
  user?: {
    name: string | null;
    avatar: unknown;
    email: string;
  };
}

export interface SavedCollectionModelType {
  id: string;
  userId: string;
  collectionId: string;
  savedAt: string;
  collection?: CollectionModelType;
}
