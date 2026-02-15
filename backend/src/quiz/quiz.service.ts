import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Quiz } from '../generated/prisma/client.js';
import { QuizCreateInput } from '../generated/prisma/models.js';

@Injectable()
export class QuizService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.quiz.findMany({
      include: {
        questions: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: {
          include: {
            options: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    return quiz;
  }

  async createQuiz(data: QuizCreateInput): Promise<Quiz> {
    return this.prisma.quiz.create({
      data: {
        title: data.title,
        questions: {
          create: Array.isArray(data.questions)
            ? data.questions.map((q: any, index: number) => ({
                text: q.text,
                timeLimit: q.timeLimit,
                order: q.order ?? index,
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

  async updateQuiz(id: string, data: any) {
    await this.prisma.option.deleteMany({
      where: {
        question: {
          quizId: id,
        },
      },
    });

    await this.prisma.question.deleteMany({
      where: {
        quizId: id,
      },
    });

    return this.prisma.quiz.update({
      where: { id },
      data: {
        title: data.title,
        questions: {
          create: data.questions.map((q: any, index: number) => ({
            text: q.text,
            timeLimit: q.timeLimit,
            order: index,
            options: {
              create: q.options,
            },
          })),
        },
      },
    });
  }

  async deleteQuiz(id: string) {
    const existing = await this.prisma.quiz.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Quiz not found');
    }

    await this.prisma.quiz.delete({
      where: { id },
    });

    return { message: 'Quiz deleted successfully' };
  }
}
