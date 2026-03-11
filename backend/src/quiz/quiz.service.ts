import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { QuizModel } from '../generated/prisma/models/Quiz.js';
import {
  QuizStatus,
  QuizType,
  QuestionType,
  Difficulty,
  QuestionSource,
} from '../generated/prisma/enums.js';
import { CreateQuizDto, UpdateQuizDto } from '../lib/dto.js';
import ExcelJS from 'exceljs';

export interface AddQuestionDto {
  content: string;
  type: QuestionType;
  difficulty?: Difficulty;
  answers: Array<{
    text: string;
    isCorrect: boolean;
  }>;
}

@Injectable()
export class QuizService {
  constructor(private prisma: PrismaService) {}

  async findAll(ownerId: string) {
    return this.prisma.quiz.findMany({
      where: { ownerId, type: QuizType.LIVE },
      include: {
        _count: {
          select: { questions: true, gameSessions: true },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: {
          include: {
            question: {
              include: {
                answers: true,
              },
            },
          },
          orderBy: {
            position: 'asc',
          },
        },
      },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    return quiz;
  }

  async createQuiz(data: CreateQuizDto, ownerId: string): Promise<QuizModel> {
    const status = data.status ?? QuizStatus.DRAFT;
    const normalizedQuestions = this.normalizeAndValidateQuestions(
      data.questions ?? [],
      status,
    );

    return this.prisma.$transaction(async (tx) => {
      const quiz = await tx.quiz.create({
        data: {
          title: data.title,
          description: data.description,
          status,
          ownerId,
          type: QuizType.LIVE,
        },
      });

      for (let i = 0; i < normalizedQuestions.length; i++) {
        const q = normalizedQuestions[i];
        const question = await tx.question.create({
          data: {
            content: q.content,
            type: q.type,
            difficulty: q.difficulty,
            answers: {
              create: q.answers,
            },
          },
        });

        await tx.quizQuestion.create({
          data: {
            quizId: quiz.id,
            questionId: question.id,
            sourceType: QuestionSource.MANUAL,
            position: i,
          },
        });
      }

      return tx.quiz.findUnique({
        where: { id: quiz.id },
        include: {
          questions: {
            include: {
              question: {
                include: {
                  answers: true,
                },
              },
            },
          },
        },
      }) as Promise<QuizModel>;
    });
  }

  async updateQuiz(id: string, body: UpdateQuizDto) {
    const existing = await this.prisma.quiz.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Quiz not found');
    }

    const status = body.status ?? QuizStatus.DRAFT;
    const normalizedQuestions = this.normalizeAndValidateQuestions(
      body.questions ?? [],
      status,
    );

    return this.prisma.$transaction(async (tx) => {
      await tx.quiz.update({
        where: { id },
        data: {
          title: body.title,
          description: body.description,
          status,
        },
      });

      // Simple implementation: delete all current QuizQuestion and Question records
      // and recreate them. (Or we could optimize by diffing)
      const currentQuestions = await tx.quizQuestion.findMany({
        where: { quizId: id },
      });

      await tx.quizQuestion.deleteMany({
        where: { quizId: id },
      });

      // Optionally delete the detached questions if they aren't referenced elsewhere (like in a bank)
      for (const cq of currentQuestions) {
        // Only delete if it's not a reference to a bank or if it's not shared
        // For simplicity in the initial upgrade, we delete MANUAL questions.
        if (
          cq.sourceType === QuestionSource.MANUAL ||
          cq.sourceType === QuestionSource.BANK_COPY
        ) {
          // We might want to check if it's still used elsewhere, but for now we follow old behavior
          await tx.question
            .delete({ where: { id: cq.questionId } })
            .catch(() => {});
        }
      }

      for (let i = 0; i < normalizedQuestions.length; i++) {
        const q = normalizedQuestions[i];
        const question = await tx.question.create({
          data: {
            content: q.content,
            type: q.type,
            difficulty: q.difficulty,
            answers: {
              create: q.answers,
            },
          },
        });

        await tx.quizQuestion.create({
          data: {
            quizId: id,
            questionId: question.id,
            sourceType: QuestionSource.MANUAL,
            position: i,
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

  async cloneQuiz(id: string, ownerId: string) {
    const original = await this.findOne(id);

    return this.prisma.$transaction(async (tx) => {
      const quiz = await tx.quiz.create({
        data: {
          title: `${original.title} (Clone)`,
          description: original.description,
          status: QuizStatus.DRAFT,
          ownerId,
          type: QuizType.LIVE,
        },
      });

      for (const qq of original.questions) {
        const newQuestion = await tx.question.create({
          data: {
            content: qq.question.content,
            type: qq.question.type,
            difficulty: qq.question.difficulty,
            answers: {
              create: qq.question.answers.map((a) => ({
                text: a.text,
                isCorrect: a.isCorrect,
              })),
            },
          },
        });

        await tx.quizQuestion.create({
          data: {
            quizId: quiz.id,
            questionId: newQuestion.id,
            sourceType: QuestionSource.MANUAL,
            position: qq.position,
          },
        });
      }

      return tx.quiz.findUnique({
        where: { id: quiz.id },
        include: {
          questions: {
            include: {
              question: {
                include: {
                  answers: true,
                },
              },
            },
          },
        },
      }) as Promise<QuizModel>;
    });
  }

  async toggleFavorite(id: string) {
    const existing = await this.prisma.quiz.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Quiz not found');
    }

    const updated = await this.prisma.quiz.update({
      where: { id },
      data: { isFavorite: !existing.isFavorite },
    });

    return updated;
  }

  async exportQuiz(id: string): Promise<Buffer> {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: {
          include: {
            question: {
              include: { answers: true },
            },
          },
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!quiz) {
      throw new Error('Quiz not found');
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Quiz');

    const maxAnswers = Math.max(
      4,
      ...quiz.questions.map((q) => q.question.answers.length),
    );

    const header = ['Question', 'Type', 'Difficulty'];

    for (let i = 1; i <= maxAnswers; i++) {
      header.push(`Answer${i}`);
    }

    header.push('Correct');

    sheet.addRow(header);

    for (const qq of quiz.questions) {
      const q = qq.question;
      const row: (string | number)[] = [q.content, q.type, q.difficulty || ''];

      q.answers.forEach((answer) => {
        row.push(answer.text);
      });

      // pad kosong kalau kurang dari maxAnswers
      for (let i = q.answers.length; i < maxAnswers; i++) {
        row.push('');
      }

      const correctIndexes = q.answers
        .map((opt, index) => (opt.isCorrect ? index + 1 : null))
        .filter(Boolean)
        .join(',');

      row.push(correctIndexes);

      sheet.addRow(row);
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async importQuiz(file: Express.Multer.File, ownerId: string) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(file.buffer as unknown as ArrayBuffer);

    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      throw new BadRequestException('Worksheet not found');
    }

    const headerRow = worksheet.getRow(1);
    const headers = headerRow.values as string[];

    const answerStartIndex = 4;
    const correctIndex = headers.findIndex(
      (h) => h?.toString().toLowerCase() === 'correct',
    );

    if (correctIndex === -1) {
      throw new BadRequestException('Correct column not found');
    }

    const questions: Array<{
      content: string;
      type: QuestionType;
      difficulty?: Difficulty;
      answers: Array<{ text: string; isCorrect: boolean }>;
    }> = [];
    const errors: string[] = [];

    for (let i = 2; i <= worksheet.rowCount; i++) {
      const row = worksheet.getRow(i);

      const content = row.getCell(1).text.trim();
      const type = (row.getCell(2).text.trim() ||
        QuestionType.MULTIPLE_CHOICE) as QuestionType;
      const difficulty = (row.getCell(3).text.trim() ||
        undefined) as Difficulty;

      if (!content) {
        errors.push(`Row ${i}: Question content is required`);
        continue;
      }

      const answers: { text: string; isCorrect: boolean }[] = [];

      for (let col = answerStartIndex; col < correctIndex; col++) {
        const value = row.getCell(col).text.trim();
        if (value) {
          answers.push({
            text: value,
            isCorrect: false,
          });
        }
      }

      if (answers.length < 2 && type !== QuestionType.ESSAY) {
        errors.push(
          `Row ${i}: Minimum 2 answers required for this question type`,
        );
        continue;
      }

      const correctRaw = row.getCell(correctIndex).text.trim();

      if (correctRaw && type !== QuestionType.ESSAY) {
        const correctIndexes = correctRaw
          .split(',')
          .map((v) => Number(v.trim()));
        for (const index of correctIndexes) {
          if (index >= 1 && index <= answers.length) {
            answers[index - 1].isCorrect = true;
          }
        }
      }

      questions.push({
        content,
        type,
        difficulty,
        answers,
      });
    }

    if (errors.length) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors,
      });
    }

    return this.prisma.$transaction(async (tx) => {
      const quiz = await tx.quiz.create({
        data: {
          title: 'Imported Quiz',
          ownerId,
          type: QuizType.LIVE,
          status: QuizStatus.DRAFT,
        },
      });

      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const question = await tx.question.create({
          data: {
            content: q.content,
            type: q.type,
            difficulty: q.difficulty,
            answers: {
              create: q.answers,
            },
          },
        });

        await tx.quizQuestion.create({
          data: {
            quizId: quiz.id,
            questionId: question.id,
            sourceType: QuestionSource.MANUAL,
            position: i,
          },
        });
      }

      return quiz;
    });
  }

  async addQuestion(quizId: string, data: AddQuestionDto) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        _count: { select: { questions: true } },
      },
    });
    if (!quiz) throw new NotFoundException('Quiz not found');

    const position = quiz._count.questions;

    return this.prisma.$transaction(async (tx) => {
      const question = await tx.question.create({
        data: {
          content: data.content || 'New Question',
          type: data.type || QuestionType.MULTIPLE_CHOICE,
          difficulty: data.difficulty,
          answers: {
            create: data.answers || [
              { text: 'Option 1', isCorrect: true },
              { text: 'Option 2', isCorrect: false },
            ],
          },
        },
        include: { answers: true },
      });

      await tx.quizQuestion.create({
        data: {
          quizId,
          questionId: question.id,
          sourceType: QuestionSource.MANUAL,
          position,
        },
      });

      return question;
    });
  }

  async removeQuestion(quizId: string, questionId: string) {
    const qq = await this.prisma.quizQuestion.findFirst({
      where: { quizId, questionId },
    });
    if (!qq) throw new NotFoundException('Question not found in this quiz');

    return this.prisma.$transaction(async (tx) => {
      await tx.quizQuestion.delete({
        where: { id: qq.id },
      });

      // Optionally delete the question if it's manual and not used elsewhere
      if (qq.sourceType === QuestionSource.MANUAL) {
        await tx.question.delete({ where: { id: questionId } }).catch(() => {});
      }
    });
  }

  private normalizeAndValidateQuestions(
    questions: any[],
    status: QuizStatus,
  ): Array<{
    content: string;
    type: QuestionType;
    difficulty?: Difficulty;
    answers: Array<{ text: string; isCorrect: boolean }>;
  }> {
    if (!Array.isArray(questions)) {
      if (status === QuizStatus.PUBLISHED) {
        throw new BadRequestException('At least 1 question is required');
      }
      return [];
    }

    if (status === QuizStatus.PUBLISHED && questions.length === 0) {
      throw new BadRequestException('At least 1 question is required');
    }

    return (questions as Array<Record<string, any>>).map((q, qIndex) => {
      const isPublished = status === QuizStatus.PUBLISHED;
      const content = typeof q.content === 'string' ? q.content.trim() : '';

      if (isPublished && !content) {
        throw new BadRequestException(
          `Question ${qIndex + 1}: Content is required`,
        );
      }

      const type = (q.type as QuestionType) || QuestionType.MULTIPLE_CHOICE;
      const difficulty = q.difficulty as Difficulty;

      const mappedAnswers = Array.isArray(q.answers)
        ? (q.answers as Array<Record<string, any>>).map((a) => ({
            text: typeof a.text === 'string' ? a.text.trim() : '',
            isCorrect: Boolean(a.isCorrect),
          }))
        : [];

      if (isPublished) {
        const strictAnswers = mappedAnswers.filter((a) => a.text !== '');

        if (type !== QuestionType.ESSAY && type !== QuestionType.SHORT_ANSWER) {
          if (strictAnswers.length < 2) {
            throw new BadRequestException(
              `Question ${qIndex + 1}: Minimum 2 answers required`,
            );
          }

          if (!strictAnswers.some((a) => a.isCorrect)) {
            throw new BadRequestException(
              `Question ${qIndex + 1}: At least 1 correct answer required`,
            );
          }
        }

        return {
          content,
          type,
          difficulty,
          answers: strictAnswers,
        };
      }

      return {
        content,
        type,
        difficulty,
        answers: mappedAnswers,
      };
    });
  }
}
