export class UpdateQuizDto {
  title: string;
  description?: string;
  questions: {
    text: string;
    timeLimit: number;
    options: {
      text: string;
      isCorrect: boolean;
    }[];
  }[];
}
