import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Quiz } from '../generated/prisma/client.js';
import { QuizCreateInput } from '../generated/prisma/models.js';

@Injectable()
export class QuizService {
  constructor(private prisma: PrismaService) {}

  async createQuiz(data: QuizCreateInput): Promise<Quiz> {
    return this.prisma.quiz.create({
      data: {
        title: data.title,
        questions: {
          create: Array.isArray(data.questions)
            ? data.questions.map((q: any, index: number) => ({
                text: q.text,
                timeLimit: q.timeLimit,
                order: index,
                options: {
                  create: Array.isArray(q.options)
                    ? q.options.map((o: any) => ({
                        text: o.text,
                        isCorrect: o.isCorrect,
                      }))
                    : [],
                },
              }))
            : [],
        },
      },
      include: {
        questions: {
          include: {
            options: true,
          },
        },
      },
    });
  }
}
