import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Quiz } from '../generated/prisma/client.js';
import { QuizCreateInput } from '../generated/prisma/models.js';
import { UpdateQuizDto } from 'src/lib/dto.js';

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

  async updateQuiz(id: string, body: UpdateQuizDto) {
    const existing = await this.prisma.quiz.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Quiz not found');
    }

    // transaction biar atomic
    return this.prisma.$transaction(async (tx) => {
      // update basic info
      await tx.quiz.update({
        where: { id },
        data: {
          title: body.title,
          description: body.description,
        },
      });

      // delete all existing questions (cascade options)
      await tx.question.deleteMany({
        where: { quizId: id },
      });

      // recreate questions
      for (let i = 0; i < body.questions.length; i++) {
        const q = body.questions[i];

        await tx.question.create({
          data: {
            quizId: id,
            text: q.text,
            timeLimit: q.timeLimit,
            order: i,
            options: {
              create: q.options.map((opt) => ({
                text: opt.text,
                isCorrect: opt.isCorrect,
              })),
            },
          },
        });
      }

      return { message: 'Quiz updated successfully' };
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
