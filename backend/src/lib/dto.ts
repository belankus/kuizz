export class CreateQuizDto {
  title: string;
  description?: string;
  status?: 'DRAFT' | 'PUBLISHED';
  questions: {
    text: string;
    timeLimit: number;
    options: {
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
    text: string;
    timeLimit: number;
    options: {
      text: string;
      isCorrect: boolean;
    }[];
  }[];
}
