import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateCollectionDto } from './dto/create-collection.dto.js';
import { UpdateCollectionDto } from './dto/update-collection.dto.js';

@Injectable()
export class CollectionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.collection.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } },
          { visibility: 'PUBLIC' },
        ],
      },
      include: {
        owner: { select: { name: true, avatar: true } },
        _count: { select: { items: true, members: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findSaved(userId: string) {
    return this.prisma.savedCollection.findMany({
      where: { userId },
      include: {
        collection: {
          include: {
            owner: { select: { name: true, avatar: true } },
            _count: { select: { items: true, members: true } },
          },
        },
      },
      orderBy: { savedAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const collection = await this.prisma.collection.findUnique({
      where: { id },
      include: {
        owner: { select: { name: true, avatar: true } },
        items: {
          include: {
            quiz: { select: { questions: { select: { id: true } } } },
            bank: { select: { questions: { select: { id: true } } } },
          },
          orderBy: { createdAt: 'desc' }, // Currently missing order field in schema, defaulting to createdAt
        },
        members: {
          include: {
            user: { select: { name: true, avatar: true, email: true } },
          },
        },
      },
    });
    if (!collection) throw new NotFoundException('Collection not found');
    return collection;
  }

  async create(userId: string, data: CreateCollectionDto) {
    return this.prisma.collection.create({
      data: {
        title: data.name,
        description: data.description,
        visibility: data.visibility || 'PRIVATE',
        ownerId: userId,
      },
    });
  }

  async update(id: string, data: UpdateCollectionDto) {
    return this.prisma.collection.update({
      where: { id },
      data: {
        title: data.name,
        description: data.description,
        visibility: data.visibility,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.collection.delete({
      where: { id },
    });
  }

  async toggleSave(userId: string, collectionId: string) {
    const existing = await this.prisma.savedCollection.findUnique({
      where: { userId_collectionId: { userId, collectionId } },
    });

    if (existing) {
      await this.prisma.savedCollection.delete({ where: { id: existing.id } });
      return { saved: false };
    } else {
      await this.prisma.savedCollection.create({
        data: { userId, collectionId },
      });
      return { saved: true };
    }
  }

  async invite(collectionId: string, email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.collectionMember.create({
      data: { collectionId, userId: user.id },
    });
  }
}
