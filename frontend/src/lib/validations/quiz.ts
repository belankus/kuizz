import { z } from "zod";

export const answerSchema = z.object({
  text: z.string().min(1, "Answer text is required"),
  isCorrect: z.boolean(),
});

export const questionSchema = z.object({
  id: z.string(),
  content: z.string().min(5, "Question text must be at least 5 characters"),
  type: z.enum(["MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER", "ESSAY"]),
  answers: z
    .array(answerSchema)
    .min(1, "At least one answer is required")
    .refine((answers) => answers.some((a) => a.isCorrect), {
      message: "At least one answer must be marked as correct",
    }),
});

export const quizSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  questions: z
    .array(questionSchema)
    .min(1, "At least one question is required"),
});

export type QuizValidationErrors = Record<string, string>;

export const formatZodErrors = (error: z.ZodError): QuizValidationErrors => {
  const errors: QuizValidationErrors = {};
  error.issues.forEach((issue) => {
    const path = issue.path.join(".");
    errors[path] = issue.message;
  });
  return errors;
};
