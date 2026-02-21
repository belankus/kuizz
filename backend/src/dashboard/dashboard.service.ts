import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getSummary(hostId: string) {
    // 1. Total Quizzes
    const totalQuizzes = await this.prisma.quiz.count({
      where: { ownerId: hostId },
    });

    // 2. Total Hosted Games & Accuracy calculation via Answers
    const hostedGames = await this.prisma.gameSession.findMany({
      where: { hostId },
      include: {
        players: {
          include: {
            answers: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalGamesHosted = hostedGames.length;
    let totalPlayers = 0;
    let totalAnswersCorrect = 0;
    let totalAnswers = 0;

    for (const session of hostedGames) {
      totalPlayers += session.players.length;
      for (const player of session.players) {
        for (const answer of player.answers) {
          totalAnswers++;
          if (answer.isCorrect) {
            totalAnswersCorrect++;
          }
        }
      }
    }

    const averageAccuracy =
      totalAnswers > 0
        ? Math.round((totalAnswersCorrect / totalAnswers) * 100)
        : 0;

    // 3. Last 7 Days chart data
    const now = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    const gamesPerDayObj: Record<string, number> = {};
    for (const d of last7Days) {
      gamesPerDayObj[d] = 0;
    }

    for (const session of hostedGames) {
      const sessionDate = new Date(session.createdAt)
        .toISOString()
        .split('T')[0];
      if (gamesPerDayObj[sessionDate] !== undefined) {
        gamesPerDayObj[sessionDate]++;
      }
    }

    const gamesPerDay = Object.keys(gamesPerDayObj).map((date) => ({
      date,
      count: gamesPerDayObj[date],
    }));

    // 4. Recent Games (top 5)
    const recentGames = hostedGames.slice(0, 5).map((session) => ({
      id: session.id,
      title: session.title,
      status: session.status,
      createdAt: session.createdAt,
      totalPlayers: session.players.length,
    }));

    return {
      metrics: {
        totalQuizzes,
        totalGamesHosted,
        totalPlayers,
        averageAccuracy,
      },
      gamesPerDay,
      recentGames,
    };
  }
}
