import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { randomUUID } from 'crypto';
import { Prisma } from '../generated/prisma/client.js';

interface Question {
  id: string;
  question: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
  timeLimit: number; // seconds
}

interface RuntimeAnswer {
  selectedOptionId: string;
  responseTime: number;
}

interface RuntimeGame {
  sessionId: string;
  roomCode: string;
  hostId: string;
  hostToken: string;
  isLocked: boolean;
  phase: string;
  currentQuestionIndex: number;
  players: {
    playerId: string;
    playerToken: string;
    nickname: string;
    score: number;
  }[];
  questions: Question[];
  answers: {
    [questionIndex: number]: {
      [playerId: string]: RuntimeAnswer;
    };
  };
  questionStartTime?: number;
  createdAt: number;
}

type SnapshotQuestion = {
  id: string;
  question: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
  timeLimit: number;
};

@Injectable()
export class GameService {
  constructor(
    private redis: RedisService,
    private prisma: PrismaService,
  ) {}

  private key(roomCode: string) {
    return `game:${roomCode}`;
  }

  async createGameFromQuiz(hostId: string, quizId: string) {
    const roomCode = await this.generateUniqueRoomCode();

    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          include: { options: true },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!quiz) throw new Error('Quiz not found');

    // 🔥 SNAPSHOT QUESTIONS
    const snapshotQuestions: SnapshotQuestion[] = quiz.questions.map((q) => {
      const correctOption = q.options.find((o) => o.isCorrect);

      if (!correctOption) {
        throw new Error(`Question "${q.text}" has no correct option`);
      }

      return {
        id: q.id,
        question: q.text,
        timeLimit: q.timeLimit,
        options: q.options.map((o) => ({
          id: o.id,
          text: o.text,
        })),
        correctOptionId: correctOption.id,
      };
    });

    // 🔥 CREATE GAME SESSION IN DB
    const session = await this.prisma.gameSession.create({
      data: {
        quizId: quiz.id,
        title: quiz.title,
        questions: snapshotQuestions as Prisma.InputJsonValue,
        totalQuestions: snapshotQuestions.length,
      },
    });

    const hostToken = randomUUID();

    const runtimeGame: RuntimeGame = {
      sessionId: session.id,
      roomCode,
      hostId,
      hostToken,
      isLocked: false,
      phase: 'WAITING',
      currentQuestionIndex: 0,
      players: [],
      questions: snapshotQuestions,
      answers: {},
      createdAt: Date.now(),
    };

    await this.redis.setJSON(this.key(roomCode), runtimeGame);
    await this.redis.expire(this.key(roomCode), 7200);

    return runtimeGame;
  }

  async finalizeGame(roomCode: string) {
    const game = await this.getGame(roomCode);
    if (!game) return;

    if (game.phase !== 'FINISHED') return;

    await this.prisma.$transaction(async (tx) => {
      for (const player of game.players) {
        const createdPlayer = await tx.gamePlayer.create({
          data: {
            session: { connect: { id: game.sessionId } },
            nickname: player.nickname,
            score: player.score,
          },
        });

        for (let i = 0; i < game.questions.length; i++) {
          const questionAnswers = game.answers[i];
          if (!questionAnswers) continue;

          const answer = questionAnswers[player.playerId];
          if (!answer) continue;

          const question = game.questions[i];

          await tx.gameAnswer.create({
            data: {
              playerId: createdPlayer.id,
              questionIndex: i,
              selectedOptionId: answer.selectedOptionId,
              isCorrect: answer.selectedOptionId === question.correctOptionId,
              responseTime: answer.responseTime,
            },
          });
        }
      }

      await tx.gameSession.update({
        where: { id: game.sessionId },
        data: {
          finishedAt: new Date(),
          status: 'FINISHED',
        },
      });
    });

    await this.redis.del(this.key(roomCode));
  }

  async getGame(roomCode: string) {
    return this.redis.getJSON<RuntimeGame>(this.key(roomCode));
  }

  async updateGame(roomCode: string, game: RuntimeGame) {
    await this.redis.setJSON(this.key(roomCode), game);
  }

  async markSessionStarted(sessionId: string) {
    await this.prisma.gameSession.updateMany({
      where: {
        id: sessionId,
        status: 'WAITING',
      },
      data: {
        status: 'STARTED',
      },
    });
  }

  private async generateUniqueRoomCode(): Promise<string> {
    let roomCode: string;
    let exists = true;

    while (exists) {
      roomCode = Math.floor(100000 + Math.random() * 900000).toString();

      const redisGame = await this.getGame(roomCode);
      const dbGame = await this.prisma.gameSession.findFirst({
        where: {
          // kalau kamu pakai status enum
          status: { in: ['WAITING', 'STARTED'] },
        },
        // kalau belum ada status, skip ini dulu
      });

      exists = !!redisGame;
    }

    return roomCode!;
  }
}
