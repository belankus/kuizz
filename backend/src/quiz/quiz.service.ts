import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma, Quiz } from '../generated/prisma/client.js';
import { CreateQuizDto, UpdateQuizDto } from 'src/lib/dto.js';
import ExcelJS from 'exceljs';

@Injectable()
export class QuizService {
  constructor(private prisma: PrismaService) {}

  async findAll(ownerId: string) {
    return this.prisma.quiz.findMany({
      where: { ownerId },
      include: {
        questions: true,
        _count: {
          select: { gameSessions: true },
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

  async createQuiz(data: CreateQuizDto, ownerId: string): Promise<Quiz> {
    const normalizedQuestions = this.normalizeAndValidateQuestions(
      data.questions ?? [],
    );

    return this.prisma.quiz.create({
      data: {
        title: data.title,
        description: data.description,
        status: data.status ?? 'DRAFT',
        ownerId,
        questions: {
          create: normalizedQuestions.map((q, index) => ({
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

    const normalizedQuestions = this.normalizeAndValidateQuestions(
      body.questions ?? [],
    );

    // transaction biar atomic
    return this.prisma.$transaction(async (tx) => {
      // update basic info
      await tx.quiz.update({
        where: { id },
        data: {
          title: body.title,
          description: body.description,
          status: body.status ?? 'DRAFT',
        },
      });

      // delete all existing questions (cascade options)
      await tx.question.deleteMany({
        where: { quizId: id },
      });

      // recreate questions
      for (let i = 0; i < normalizedQuestions.length; i++) {
        const q = normalizedQuestions[i];

        await tx.question.create({
          data: {
            quizId: id,
            text: q.text,
            timeLimit: q.timeLimit,
            order: i,
            options: {
              create: q.options,
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
          include: { options: true },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!quiz) {
      throw new Error('Quiz not found');
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Quiz');

    const maxOptions = Math.max(
      4,
      ...quiz.questions.map((q) => q.options.length),
    );

    const header = ['Question', 'TimeLimit'];

    for (let i = 1; i <= maxOptions; i++) {
      header.push(`Option${i}`);
    }

    header.push('Correct');

    sheet.addRow(header);

    for (const question of quiz.questions) {
      const row: (string | number)[] = [question.text, question.timeLimit];

      question.options.forEach((option) => {
        row.push(option.text);
      });

      // pad kosong kalau kurang dari maxOptions
      for (let i = question.options.length; i < maxOptions; i++) {
        row.push('');
      }

      const correctIndexes = question.options
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

    const optionStartIndex = 3;
    const correctIndex = headers.findIndex(
      (h) => h?.toString().toLowerCase() === 'correct',
    );

    if (correctIndex === -1) {
      throw new BadRequestException('Correct column not found');
    }

    const questions: {
      text: string;
      timeLimit: number;
      options: Prisma.OptionCreateWithoutQuestionInput[];
    }[] = [];

    const errors: string[] = [];

    for (let i = 2; i <= worksheet.rowCount; i++) {
      const row = worksheet.getRow(i);

      const questionText = row.getCell(1).text.trim();
      const rawTimeLimit = row.getCell(2).value;
      const timeLimit = Number(rawTimeLimit) || 20;

      if (!questionText) {
        errors.push(`Row ${i}: Question text is required`);
        continue;
      }

      if (timeLimit < 5 || timeLimit > 300) {
        errors.push(`Row ${i}: TimeLimit must be between 5 and 300`);
      }

      const options: Prisma.OptionCreateWithoutQuestionInput[] = [];

      for (let col = optionStartIndex; col < correctIndex; col++) {
        const value = row.getCell(col).text.trim();
        if (value) {
          options.push({
            text: value,
            isCorrect: false,
          });
        }
      }

      if (options.length < 2) {
        errors.push(`Row ${i}: Minimum 2 options required`);
        continue;
      }

      if (options.length > 8) {
        errors.push(`Row ${i}: Maximum 8 options allowed`);
      }

      const correctRaw = row.getCell(correctIndex).text.trim();

      if (!correctRaw) {
        errors.push(`Row ${i}: Correct column required`);
        continue;
      }

      const correctIndexes = correctRaw.split(',').map((v) => Number(v.trim()));

      for (const index of correctIndexes) {
        if (!index || index < 1 || index > options.length) {
          errors.push(`Row ${i}: Correct index "${index}" out of range`);
        } else {
          options[index - 1].isCorrect = true;
        }
      }

      if (!options.some((o) => o.isCorrect)) {
        errors.push(`Row ${i}: At least 1 correct answer required`);
        continue;
      }

      questions.push({
        text: questionText,
        timeLimit,
        options,
      });
    }

    if (errors.length) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors,
      });
    }

    if (!questions.length) {
      throw new BadRequestException('No valid questions found');
    }

    return this.prisma.$transaction(async (tx) => {
      const quiz = await tx.quiz.create({
        data: {
          title: 'Imported Quiz',
          ownerId,
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
        include: { questions: true },
      });

      return quiz;
    });
  }

  private normalizeAndValidateQuestions(
    questions: NonNullable<CreateQuizDto['questions']>,
  ) {
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new BadRequestException('At least 1 question is required');
    }

    return questions.map((q, qIndex) => {
      if (!q.text || !q.text.trim()) {
        throw new BadRequestException(
          `Question ${qIndex + 1}: Text is required`,
        );
      }

      const timeLimit =
        Number(q.timeLimit) >= 5 && Number(q.timeLimit) <= 300
          ? Number(q.timeLimit)
          : 20;

      // 🔥 FILTER OPTION KOSONG
      const filteredOptions = Array.isArray(q.options)
        ? q.options
            .filter((o) => o.text && o.text.trim() !== '')
            .map((o) => ({
              text: o.text.trim(),
              isCorrect: Boolean(o.isCorrect),
            }))
        : [];

      if (filteredOptions.length < 2) {
        throw new BadRequestException(
          `Question ${qIndex + 1}: Minimum 2 options required`,
        );
      }

      if (!filteredOptions.some((o) => o.isCorrect)) {
        throw new BadRequestException(
          `Question ${qIndex + 1}: At least 1 correct answer required`,
        );
      }

      if (filteredOptions.length > 8) {
        throw new BadRequestException(
          `Question ${qIndex + 1}: Maximum 8 options allowed`,
        );
      }

      return {
        text: q.text.trim(),
        timeLimit,
        options: filteredOptions,
      };
    });
  }
}
