import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateCollectionItemDto } from './dto/create-collection-item.dto.js';
import { UpdateCollectionItemDto } from './dto/update-collection-item.dto.js';

@Injectable()
export class CollectionItemsService {
  constructor(private prisma: PrismaService) {}

  async create(collectionId: string, data: CreateCollectionItemDto) {
    if (data.type === 'QUIZ_TEMPLATE' && !data.quizId) {
      throw new BadRequestException('quizId is required for QUIZ_TEMPLATE');
    }
    if (data.type === 'QUESTION_BANK' && !data.bankId) {
      throw new BadRequestException('bankId is required for QUESTION_BANK');
    }

    const item = await this.prisma.collectionItem.create({
      data: {
        collectionId,
        type: data.type,
        quizId: data.quizId || null,
        bankId: data.bankId || null,
      },
      include: {
        quiz: true,
        bank: true,
      },
    });

    // Update the item count on the collection
    await this.prisma.collection.update({
      where: { id: collectionId },
      data: { itemsCount: { increment: 1 } },
    });

    return item;
  }

  async update(id: string, data: UpdateCollectionItemDto) {
    return this.prisma.collectionItem.update({
      where: { id },
      data: {
        type: data.type,
        quizId: data.quizId,
        bankId: data.bankId,
      },
    });
  }

  async remove(id: string) {
    const item = await this.prisma.collectionItem.delete({
      where: { id },
    });

    // Decrement item count
    await this.prisma.collection.update({
      where: { id: item.collectionId },
      data: { itemsCount: { decrement: 1 } },
    });

    return item;
  }
}
