import { QuestionType, Difficulty } from '../generated/prisma/enums.js';

export class CreateQuizDto {
  title: string;
  description?: string;
  status?: 'DRAFT' | 'PUBLISHED';
  questions: {
    content: string;
    type: QuestionType;
    difficulty?: Difficulty;
    answers: {
      text: string;
      isCorrect: boolean;
    }[];
  }[];
}

export class UpdateQuizDto {
  title: string;
  description?: string;
  status?: 'DRAFT' | 'PUBLISHED';
  questions: {
    content: string;
    type: QuestionType;
    difficulty?: Difficulty;
    answers: {
      text: string;
      isCorrect: boolean;
    }[];
  }[];
}
