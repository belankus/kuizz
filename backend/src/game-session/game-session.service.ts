import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class GameSessionService {
  constructor(private prisma: PrismaService) {}

  async findAllPaginated(
    hostId: string,
    page: number = 1,
    limit: number = 10,
    search: string = '',
  ) {
    const skip = (page - 1) * limit;

    const where = {
      hostId,
      title: { contains: search, mode: 'insensitive' as const },
    };

    const [total, data] = await Promise.all([
      this.prisma.gameSession.count({ where }),
      this.prisma.gameSession.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { players: true },
          },
        },
      }),
    ]);

    return {
      data: data.map((d) => ({
        id: d.id,
        title: d.title,
        status: d.status,
        createdAt: d.createdAt,
        finishedAt: d.finishedAt,
        totalPlayers: d._count.players,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getStats(sessionId: string, hostId: string) {
    const session = await this.prisma.gameSession.findUnique({
      where: { id: sessionId, hostId },
      include: {
        players: {
          include: {
            answers: true,
          },
        },
      },
    });

    if (!session) throw new NotFoundException('Game session not found');

    const totalPlayers = session.players.length;
    let totalScore = 0;

    // Calculate top scoreres
    const topPlayers = [...session.players]
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((p) => ({
        id: p.id,
        nickname: p.nickname,
        score: p.score,
      }));

    // Question analytics
    const questionsAnalytics = Array.from(
      { length: session.totalQuestions },
      (_, i) => ({
        questionIndex: i,
        correct: 0,
        incorrect: 0,
      }),
    );

    let totalAnswersCorrect = 0;
    let totalAnswersTotal = 0;

    for (const player of session.players) {
      totalScore += player.score;
      for (const answer of player.answers) {
        totalAnswersTotal++;
        if (answer.isCorrect) {
          totalAnswersCorrect++;
          questionsAnalytics[answer.questionIndex].correct++;
        } else {
          questionsAnalytics[answer.questionIndex].incorrect++;
        }
      }
    }

    const averageScore =
      totalPlayers > 0 ? Math.round(totalScore / totalPlayers) : 0;
    const accuracyRate =
      totalAnswersTotal > 0
        ? Math.round((totalAnswersCorrect / totalAnswersTotal) * 100)
        : 0;

    return {
      session: {
        id: session.id,
        title: session.title,
        createdAt: session.createdAt,
        finishedAt: session.finishedAt,
        status: session.status,
        totalQuestions: session.totalQuestions,
      },
      stats: {
        totalPlayers,
        averageScore,
        accuracyRate, // overall accuracy percentage
      },
      topPlayers,
      questionsAnalytics,
    };
  }

  async delete(sessionId: string, hostId: string) {
    const session = await this.prisma.gameSession.findUnique({
      where: { id: sessionId, hostId },
    });

    if (!session) throw new NotFoundException('Game session not found');

    return this.prisma.gameSession.delete({
      where: { id: sessionId },
    });
  }
}
