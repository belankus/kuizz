import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  CreateQuestionBankDto,
  UpdateQuestionBankDto,
  AddQuestionToBankDto,
} from './dto/question-bank.dto.js';
import { BankVisibility } from '../generated/prisma/enums.js';

@Injectable()
export class QuestionBanksService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(ownerId: string) {
    return this.prisma.questionBank.findMany({
      where: {
        OR: [
          { ownerId },
          { visibility: BankVisibility.PUBLIC },
          { visibility: BankVisibility.SHARED }, // Simplified SHARED for now
        ],
      },
      include: {
        _count: {
          select: { items: true },
        },
        owner: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const bank = await this.prisma.questionBank.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            question: {
              include: {
                answers: true,
              },
            },
          },
        },
        owner: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!bank) {
      throw new NotFoundException(`Question bank with ID ${id} not found`);
    }

    return bank;
  }

  async create(data: CreateQuestionBankDto, ownerId: string) {
    return this.prisma.questionBank.create({
      data: {
        ...data,
        ownerId,
      },
    });
  }

  async update(id: string, data: UpdateQuestionBankDto) {
    return this.prisma.questionBank.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.questionBank.delete({
      where: { id },
    });
  }

  async addQuestion(bankId: string, data: AddQuestionToBankDto) {
    return this.prisma.$transaction(async (tx) => {
      const question = await tx.question.create({
        data: {
          content: data.content,
          type: data.type,
          difficulty: data.difficulty,
          answers: {
            create: data.answers.map((a) => ({
              text: a.text,
              isCorrect: a.isCorrect,
            })),
          },
        },
      });

      await tx.questionBankItem.create({
        data: {
          bankId,
          questionId: question.id,
        },
      });

      return question; // Cast to any to satisfy general response type if needed
    });
  }

  async removeQuestion(bankId: string, questionId: string) {
    return this.prisma.questionBankItem.delete({
      where: {
        bankId_questionId: {
          bankId,
          questionId,
        },
      },
    });
  }
}
