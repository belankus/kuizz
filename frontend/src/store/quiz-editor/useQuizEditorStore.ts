import { create } from "zustand";

export type QuestionType =
  | "MULTIPLE_CHOICE"
  | "TRUE_FALSE"
  | "SHORT_ANSWER"
  | "ESSAY";
export type Difficulty = "EASY" | "MEDIUM" | "HARD";
export type QuestionSource =
  | "MANUAL"
  | "BANK_COPY"
  | "BANK_REFERENCE"
  | "TEMPLATE";

export interface Answer {
  id?: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  content: string;
  type: QuestionType;
  difficulty?: Difficulty;
  answers: Answer[];
  sourceType: QuestionSource;
  sourceBankId?: string;
  position: number;
}

export interface QuizEditorState {
  quizId: string | null;
  title: string;
  description: string;
  questions: Question[];
  selectedQuestionId: string | null;
  isSaving: boolean;
  errors: Record<string, string>;

  // Actions
  setQuiz: (quiz: {
    id: string;
    title: string;
    description?: string;
    questions: Array<{
      sourceType: QuestionSource;
      sourceBankId?: string;
      position: number;
      question: Partial<Question>;
    }>;
  }) => void;
  updateQuizInfo: (info: { title?: string; description?: string }) => void;
  addQuestion: (question: Partial<Question>) => void;
  updateQuestion: (id: string, updates: Partial<Question>) => void;
  removeQuestion: (id: string) => void;
  selectQuestion: (id: string | null) => void;
  reorderQuestions: (startIndex: number, endIndex: number) => void;
  setSaving: (isSaving: boolean) => void;
  setErrors: (errors: Record<string, string>) => void;
  clearErrors: () => void;
}

export const useQuizEditorStore = create<QuizEditorState>((set) => ({
  quizId: null,
  title: "",
  description: "",
  questions: [],
  selectedQuestionId: null,
  isSaving: false,
  errors: {},

  setQuiz: (quiz) => {
    const questions =
      (quiz.questions?.map((qq) => ({
        ...qq.question,
        sourceType: qq.sourceType,
        sourceBankId: qq.sourceBankId,
        position: qq.position,
      })) as Question[]) || [];

    set({
      quizId: quiz.id,
      title: quiz.title,
      description: quiz.description || "",
      questions,
      selectedQuestionId: questions.length > 0 ? questions[0].id : null,
    });
  },

  updateQuizInfo: (info) => set((state) => ({ ...state, ...info })),

  addQuestion: (question) =>
    set((state) => {
      const newQuestion: Question = {
        id: crypto.randomUUID(),
        content: "New Question",
        type: "MULTIPLE_CHOICE",
        answers: [
          { text: "Option 1", isCorrect: true },
          { text: "Option 2", isCorrect: false },
        ],
        sourceType: "MANUAL",
        position: state.questions.length,
        ...question,
      };
      return {
        questions: [...state.questions, newQuestion],
        selectedQuestionId: newQuestion.id,
      };
    }),

  updateQuestion: (id, updates) =>
    set((state) => ({
      questions: state.questions.map((q) =>
        q.id === id ? { ...q, ...updates } : q,
      ),
    })),

  removeQuestion: (id) =>
    set((state) => {
      const newQuestions = state.questions.filter((q) => q.id !== id);
      return {
        questions: newQuestions,
        selectedQuestionId:
          state.selectedQuestionId === id
            ? newQuestions.length > 0
              ? newQuestions[0].id
              : null
            : state.selectedQuestionId,
      };
    }),

  selectQuestion: (id) => set({ selectedQuestionId: id }),

  reorderQuestions: (startIndex, endIndex) =>
    set((state) => {
      const result = Array.from(state.questions);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return {
        questions: result.map((q, index) => ({ ...q, position: index })),
      };
    }),

  setSaving: (isSaving) => set({ isSaving }),

  setErrors: (errors) => set({ errors }),

  clearErrors: () => set({ errors: {} }),
}));
