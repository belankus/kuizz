import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { QuizType, QuestionSource } from '../generated/prisma/enums.js';

@Injectable()
export class TemplatesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.quiz.findMany({
      where: { type: QuizType.TEMPLATE, status: 'PUBLISHED' },
      include: {
        _count: {
          select: { questions: true },
        },
        questions: {
          include: {
            question: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const template = await this.prisma.quiz.findFirst({
      where: { id, type: QuizType.TEMPLATE },
      include: {
        questions: {
          include: {
            question: {
              include: {
                answers: true,
              },
            },
          },
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!template) {
      throw new NotFoundException(`Template with ID ${id} not found`);
    }

    return template;
  }

  async useTemplate(templateId: string, userId: string) {
    const template = await this.findOne(templateId);

    return this.prisma.$transaction(async (tx) => {
      const newQuiz = await tx.quiz.create({
        data: {
          title: template.title,
          description: template.description,
          ownerId: userId,
          type: QuizType.LIVE,
          status: 'DRAFT',
        },
      });

      for (const tq of template.questions) {
        // We COPY the questions for the new quiz as per "BANK_COPY" or "TEMPLATE" logic
        const newQuestion = await tx.question.create({
          data: {
            content: tq.question.content,
            type: tq.question.type,
            difficulty: tq.question.difficulty,
            answers: {
              create: tq.question.answers.map((a) => ({
                text: a.text,
                isCorrect: a.isCorrect,
              })),
            },
          },
        });

        await tx.quizQuestion.create({
          data: {
            quizId: newQuiz.id,
            questionId: newQuestion.id,
            sourceType: QuestionSource.TEMPLATE,
            position: tq.position,
          },
        });
      }

      return newQuiz;
    });
  }
}
