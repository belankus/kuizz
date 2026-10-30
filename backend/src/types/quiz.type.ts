import { UserModelType } from "./index.js";

export type QuizVisibility = 'PRIVATE' | 'SHARED' | 'PUBLIC';

export interface QuizAccessModelType {
  id: string;
  quizId: string;
  userId: string;
  user?: UserModelType;
  createdAt: Date;
}

export interface QuizModelType {
  title: string;
  description?: string;
  status?: 'DRAFT' | 'PUBLISHED';
  visibility: QuizVisibility;
  ownerId?: string;
  questions: QuestionModelType[];
  isFavorite?: boolean;
  sharedWith?: QuizAccessModelType[];
}

export interface QuestionModelType {
  id: string;
  quizId?: string;
  text: string;
  timeLimit: number;
  order?: number;
  mediaUrl?: string;
  options: OptionModelType[];
}

export interface OptionModelType {
  questionId?: string;
  text: string;
  isCorrect: boolean;
}
