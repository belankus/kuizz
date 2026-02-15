import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma, Quiz } from '../generated/prisma/client.js';
import { QuizCreateInput } from '../generated/prisma/models.js';
import { UpdateQuizDto } from 'src/lib/dto.js';
import ExcelJS from 'exceljs';

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
  async exportQuiz(id: string): Promise<Buffer> {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: {
          include: {
            options: true,
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!quiz) {
      throw new Error('Quiz not found');
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Quiz');

    const maxOptions = Math.max(...quiz.questions.map((q) => q.options.length));

    const header = ['Question', 'TimeLimit'];

    for (let i = 1; i <= maxOptions; i++) {
      header.push(`Option${i}`);
      header.push(`Correct${i}`);
    }

    sheet.addRow(header);

    for (const question of quiz.questions) {
      const row = [question.text, question.timeLimit];

      for (let i = 0; i < maxOptions; i++) {
        const option = question.options[i];

        if (option) {
          row.push(option.text);
          row.push(option.isCorrect ? 'YES' : 'NO');
        } else {
          row.push('');
          row.push('');
        }
      }

      sheet.addRow(row);
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async importQuiz(file: Express.Multer.File) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(file.buffer as any);

    const worksheet = workbook.worksheets[0];

    if (!worksheet) {
      throw new Error('Worksheet not found');
    }

    const questions: {
      text: string;
      timeLimit: number;
      options: Prisma.OptionCreateWithoutQuestionInput[];
    }[] = [];

    // Skip header (row 1)
    for (let i = 2; i <= worksheet.rowCount; i++) {
      const row = worksheet.getRow(i);

      const questionText = row.getCell(1).value?.toString().trim();
      const timeLimit = Number(row.getCell(2).value) || 20;

      if (!questionText) continue;

      const options: Prisma.OptionCreateWithoutQuestionInput[] = [];

      // mulai kolom 3 → dynamic
      for (let col = 3; col <= row.cellCount; col += 2) {
        const optionText = row.getCell(col).value?.toString().trim();
        const correctValue = row
          .getCell(col + 1)
          .value?.toString()
          .trim();

        if (!optionText) continue;

        options.push({
          text: optionText,
          isCorrect: correctValue?.toUpperCase() === 'YES',
        });
      }

      // 🔥 VALIDATION
      if (options.length < 2) {
        throw new BadRequestException(
          `Row ${i}: Question "${questionText}" must have at least 2 options`,
        );
      }

      if (!options.some((o) => o.isCorrect)) {
        throw new BadRequestException(
          `Row ${i}: Question "${questionText}" must have at least 1 correct answer`,
        );
      }

      questions.push({
        text: questionText,
        timeLimit,
        options,
      });
    }

    if (!questions.length) {
      throw new BadRequestException('No valid questions found');
    }

    // 🔥 CREATE QUIZ
    const quiz = await this.prisma.quiz.create({
      data: {
        title: 'Imported Quiz',
        questions: {
          create: questions.map((q, index) => ({
            text: q.text,
            timeLimit: q.timeLimit,
            order: index,
            options: {
              create: q.options,
            },
          })),
        },
      },
      include: {
        questions: true,
      },
    });

    return quiz;
  }
}
