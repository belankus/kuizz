export interface QuizModelType {
  title: string;
  description?: string;
  status?: "DRAFT" | "PUBLISHED";
  ownerId?: string;
  questions: QuestionModelType[];
  isFavorite?: boolean;
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
