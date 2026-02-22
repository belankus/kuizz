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
        roomCode: d.roomCode, // NEW: return roomCode
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

    // Player DETAILS
    const parsedQuestions = session.questions as Array<{ timeLimit: number }>;

    const playersDetail = session.players.map((player) => {
      const formattedAnswers = player.answers.map((ans) => {
        const qTimeLimit = parsedQuestions[ans.questionIndex]?.timeLimit || 20;
        const timeFactor = 1 - ans.responseTime / (qTimeLimit * 1000);
        const calculatedScore = ans.isCorrect
          ? Math.max(0, Math.floor(1000 * timeFactor))
          : 0;

        return {
          questionIndex: ans.questionIndex,
          isCorrect: ans.isCorrect,
          responseTime: ans.responseTime,
          score: calculatedScore,
        };
      });

      return {
        id: player.id,
        nickname: player.nickname,
        totalScore: player.score,
        answers: formattedAnswers.sort(
          (a, b) => a.questionIndex - b.questionIndex,
        ),
      };
    });

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
      playersDetail,
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

  async getPlayerDetail(sessionId: string, playerId: string, hostId: string) {
    const session = await this.prisma.gameSession.findUnique({
      where: { id: sessionId, hostId },
      include: {
        players: {
          where: { id: playerId },
          include: {
            answers: true,
          },
        },
      },
    });

    if (!session || session.players.length === 0) {
      throw new NotFoundException('Player or session not found');
    }

    const player = session.players[0];

    return {
      id: player.id,
      nickname: player.nickname,
      score: player.score,
      joinedAt: player.joinedAt,
      session: {
        title: session.title,
        createdAt: session.createdAt,
        questions: session.questions,
        totalQuestions: session.totalQuestions,
      },
      answers: player.answers,
    };
  }
}
