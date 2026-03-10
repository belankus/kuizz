import { QuizStatus } from '../../generated/prisma/enums.js';

export interface PartialQuiz {
  status: QuizStatus;
  ownerId: string | null;
}

export function canViewQuiz(
  quiz: PartialQuiz,
  userId: string | undefined,
): boolean {
  if (quiz.status === QuizStatus.PUBLISHED) return true;
  return quiz.ownerId === userId;
}

export function canEditQuiz(quiz: PartialQuiz, userId: string): boolean {
  return quiz.ownerId === userId;
}

export function canDeleteQuiz(quiz: PartialQuiz, userId: string): boolean {
  return quiz.ownerId === userId;
}
