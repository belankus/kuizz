import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { randomUUID } from 'crypto';
import { Prisma } from '../generated/prisma/client.js';

interface RuntimeAnswer {
  selectedOptionId: string;
  responseTime: number;
}

export interface GameInfo {
  sessionId: string;
  hostId: string;
  hostToken: string;
  phase: string;
  roomCode: string;
  isLocked: boolean;
  currentQuestionIndex: number;
  questionStartTime?: number;
  createdAt: number;
  title: string;
}

export type SnapshotQuestion = {
  id: string;
  question: string;
  options: { id: string; text: string }[];
  correctOptionIds: string[];
  timeLimit: number;
};

@Injectable()
export class GameService {
  constructor(
    private redis: RedisService,
    private prisma: PrismaService,
  ) {}

  private infoKey(roomCode: string) {
    return `game:${roomCode}:info`;
  }
  private questionsKey(roomCode: string) {
    return `game:${roomCode}:questions`;
  }
  private playersKey(roomCode: string) {
    return `game:${roomCode}:players`;
  }
  private nicknamesKey(roomCode: string) {
    return `game:${roomCode}:nicknames`;
  }
  private scoresKey(roomCode: string) {
    return `game:${roomCode}:scores`;
  }
  private answersKey(roomCode: string, questionIndex: number) {
    return `game:${roomCode}:answers:${questionIndex}`;
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
      const correctOptions = q.options.filter((o) => o.isCorrect);

      if (correctOptions.length === 0) {
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
        correctOptionIds: correctOptions.map((o) => o.id),
      };
    });

    // 🔥 CREATE GAME SESSION IN DB
    const session = await this.prisma.gameSession.create({
      data: {
        hostId,
        roomCode, // <= NEW: Store roomCode
        quizId: quiz.id,
        title: quiz.title,
        questions: snapshotQuestions as Prisma.InputJsonValue,
        totalQuestions: snapshotQuestions.length,
      },
    });

    const hostToken = randomUUID();

    const client = this.redis.getClient();
    const pipeline = client.pipeline();

    // Store Info Hash
    pipeline.hset(this.infoKey(roomCode), {
      sessionId: session.id,
      roomCode,
      hostId,
      hostToken,
      isLocked: 'false', // redis stores strings
      phase: 'WAITING',
      currentQuestionIndex: '0',
      createdAt: Date.now().toString(),
      title: quiz.title,
    });

    // Store Questions Snapshot JSON String
    pipeline.set(
      this.questionsKey(roomCode),
      JSON.stringify(snapshotQuestions),
    );

    // Execute pipeline and set expiry (2 hours)
    await pipeline.exec();

    await client.expire(this.infoKey(roomCode), 7200);
    await client.expire(this.questionsKey(roomCode), 7200);
    await client.expire(this.playersKey(roomCode), 7200);
    await client.expire(this.nicknamesKey(roomCode), 7200);
    await client.expire(this.scoresKey(roomCode), 7200);

    return {
      sessionId: session.id,
      roomCode,
      hostId,
      hostToken,
      isLocked: false,
      phase: 'WAITING',
      currentQuestionIndex: 0,
    };
  }

  async finalizeGame(roomCode: string) {
    const info = await this.getGameInfo(roomCode);
    if (!info || info.phase !== 'FINISHED') return;

    const players = await this.getPlayers(roomCode);
    const questionsText = await this.redis
      .getClient()
      .get(this.questionsKey(roomCode));
    const questions = (
      questionsText ? JSON.parse(questionsText) : []
    ) as SnapshotQuestion[];

    await this.prisma.$transaction(async (tx) => {
      for (const playerToken in players) {
        const player = players[playerToken];
        const score = await this.getPlayerScore(roomCode, playerToken);

        const createdPlayer = await tx.gamePlayer.create({
          data: {
            session: { connect: { id: info.sessionId } },
            nickname: player.nickname,
            score: score,
            ...(player.userId
              ? { user: { connect: { id: player.userId } } }
              : {}),
          },
        });

        for (let i = 0; i < questions.length; i++) {
          const answerData = await this.getAnswer(roomCode, i, playerToken);
          if (!answerData) continue;

          const question = questions[i];

          await tx.gameAnswer.create({
            data: {
              playerId: createdPlayer.id,
              questionIndex: i,
              selectedOptionId: answerData.selectedOptionId,
              isCorrect: question.correctOptionIds.includes(
                answerData.selectedOptionId,
              ),
              responseTime: answerData.responseTime,
            },
          });
        }
      }

      await tx.gameSession.update({
        where: { id: info.sessionId },
        data: {
          finishedAt: new Date(),
          status: 'FINISHED',
        },
      });
    });

    // Cleanup Redis
    await this.deleteRoomData(roomCode, questions.length);
  }

  // === ATOMIC GAME METHODS ===

  async getGameInfo(roomCode: string): Promise<GameInfo | null> {
    const data = await this.redis.getClient().hgetall(this.infoKey(roomCode));
    if (Object.keys(data).length === 0) return null;
    return {
      sessionId: data.sessionId,
      hostId: data.hostId,
      hostToken: data.hostToken,
      phase: data.phase,
      roomCode: data.roomCode,
      isLocked: data.isLocked === 'true',
      currentQuestionIndex: parseInt(data.currentQuestionIndex || '0', 10),
      questionStartTime: data.questionStartTime
        ? parseInt(data.questionStartTime, 10)
        : undefined,
      createdAt: parseInt(data.createdAt, 10),
      title: data.title || 'Untitled Quiz',
    };
  }

  async updateGameInfo(roomCode: string, updates: Record<string, any>) {
    const stringified = Object.fromEntries(
      Object.entries(updates).map(([k, v]) => [k, String(v)]),
    );
    await this.redis.getClient().hset(this.infoKey(roomCode), stringified);
  }

  async checkAndAddNickname(
    roomCode: string,
    nickname: string,
  ): Promise<boolean> {
    const added = await this.redis
      .getClient()
      .sadd(this.nicknamesKey(roomCode), nickname.toLowerCase());
    return added === 1; // 1 if added (unique), 0 if already existed
  }

  async addPlayer(
    roomCode: string,
    playerToken: string,
    playerId: string,
    nickname: string,
    avatar?: object | null,
    userId?: string | null,
  ) {
    const client = this.redis.getClient();
    await client.hset(
      this.playersKey(roomCode),
      playerToken,
      JSON.stringify({
        playerId,
        nickname,
        avatar: avatar ?? null,
        userId: userId ?? null,
      }),
    );
    await client.zadd(this.scoresKey(roomCode), 0, playerToken);
  }

  async updatePlayerId(
    roomCode: string,
    playerToken: string,
    newPlayerId: string,
  ) {
    const client = this.redis.getClient();
    const data = await client.hget(this.playersKey(roomCode), playerToken);
    if (data) {
      const parsed = JSON.parse(data) as {
        playerId: string;
        nickname: string;
      };
      parsed.playerId = newPlayerId;
      await client.hset(
        this.playersKey(roomCode),
        playerToken,
        JSON.stringify(parsed),
      );
    }
  }

  async getPlayersList(roomCode: string) {
    const playersMap = await this.getPlayers(roomCode);
    const scores = await this.getScoresMap(roomCode);

    return Object.entries(playersMap).map(([playerToken, data]) => ({
      playerToken,
      playerId: data.playerId,
      nickname: data.nickname,
      avatar: data.avatar ?? null,
      userId: data.userId ?? null,
      score: scores[playerToken] || 0,
    }));
  }

  async getQuestions(roomCode: string): Promise<SnapshotQuestion[]> {
    const data = await this.redis.getClient().get(this.questionsKey(roomCode));
    return data ? (JSON.parse(data) as SnapshotQuestion[]) : [];
  }

  async submitAnswer(
    roomCode: string,
    questionIndex: number,
    playerToken: string,
    selectedOptionId: string,
    responseTime: number,
  ) {
    const added = await this.redis
      .getClient()
      .hsetnx(
        this.answersKey(roomCode, questionIndex),
        playerToken,
        JSON.stringify({ selectedOptionId, responseTime }),
      );
    // Also set expiry for the answers key
    await this.redis
      .getClient()
      .expire(this.answersKey(roomCode, questionIndex), 7200);
    return added === 1; // true if this was their first answer
  }

  async getAnswer(
    roomCode: string,
    questionIndex: number,
    playerToken: string,
  ): Promise<RuntimeAnswer | null> {
    const data = await this.redis
      .getClient()
      .hget(this.answersKey(roomCode, questionIndex), playerToken);
    return data ? (JSON.parse(data) as RuntimeAnswer) : null;
  }

  async getAnswerStats(
    roomCode: string,
    questionIndex: number,
  ): Promise<Record<string, number>> {
    const allAnswers = await this.redis
      .getClient()
      .hgetall(this.answersKey(roomCode, questionIndex));
    const stats: Record<string, number> = {};
    for (const val of Object.values(allAnswers)) {
      const ans = JSON.parse(val) as RuntimeAnswer;
      stats[ans.selectedOptionId] = (stats[ans.selectedOptionId] || 0) + 1;
    }
    return stats;
  }

  async incrementScore(roomCode: string, playerToken: string, amount: number) {
    await this.redis
      .getClient()
      .zincrby(this.scoresKey(roomCode), amount, playerToken);
  }

  async getLeaderboard(roomCode: string) {
    // Get descending order, with scores
    const result = await this.redis
      .getClient()
      .zrevrange(this.scoresKey(roomCode), 0, -1, 'WITHSCORES');
    const playersMap = await this.getPlayers(roomCode);

    const leaderboard: {
      playerToken: string;
      playerId: string;
      nickname: string;
      score: number;
      avatar?: object | null;
      userId?: string | null;
    }[] = [];
    for (let i = 0; i < result.length; i += 2) {
      const playerToken = result[i];
      const score = parseInt(result[i + 1], 10);
      const playerData = playersMap[playerToken];

      if (playerData) {
        leaderboard.push({
          playerToken,
          playerId: playerData.playerId,
          nickname: playerData.nickname,
          score,
          avatar: playerData.avatar ?? null,
          userId: playerData.userId ?? null,
        });
      }
    }
    return leaderboard;
  }

  // === INTERNAL HELPERS ===

  private async getPlayers(roomCode: string): Promise<
    Record<
      string,
      {
        playerId: string;
        nickname: string;
        avatar?: object | null;
        userId?: string | null;
      }
    >
  > {
    const raw = await this.redis.getClient().hgetall(this.playersKey(roomCode));
    const result: Record<
      string,
      {
        playerId: string;
        nickname: string;
        avatar?: object | null;
        userId?: string | null;
      }
    > = {};
    for (const key in raw) {
      result[key] = JSON.parse(raw[key]) as {
        playerId: string;
        nickname: string;
        avatar?: object | null;
        userId?: string | null;
      };
    }
    return result;
  }

  private async getScoresMap(
    roomCode: string,
  ): Promise<Record<string, number>> {
    const result = await this.redis
      .getClient()
      .zrevrange(this.scoresKey(roomCode), 0, -1, 'WITHSCORES');
    const map: Record<string, number> = {};
    for (let i = 0; i < result.length; i += 2) {
      map[result[i]] = parseInt(result[i + 1], 10);
    }
    return map;
  }

  private async getPlayerScore(
    roomCode: string,
    playerToken: string,
  ): Promise<number> {
    const score = await this.redis
      .getClient()
      .zscore(this.scoresKey(roomCode), playerToken);
    return score ? parseInt(score, 10) : 0;
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

      const hasInfo = await this.redis
        .getClient()
        .exists(this.infoKey(roomCode));
      // Need a better check for DB if required, but normally Redis is source of truth for "active now"

      exists = hasInfo > 0;
    }

    return roomCode!;
  }

  private async deleteRoomData(roomCode: string, totalQuestions: number) {
    const client = this.redis.getClient();
    const keys = [
      this.infoKey(roomCode),
      this.questionsKey(roomCode),
      this.playersKey(roomCode),
      this.nicknamesKey(roomCode),
      this.scoresKey(roomCode),
    ];
    for (let i = 0; i < totalQuestions; i++) {
      keys.push(this.answersKey(roomCode, i));
    }
    await client.del(...keys);
  }
}
