import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService, SnapshotQuestion } from './game.service.js';
import { randomUUID } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

interface CustomSocket extends Socket {
  data: {
    playerToken?: string;
  };
}

@WebSocketGateway({
  cors: { origin: '*' },
})
export class GameGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private gameService: GameService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  @SubscribeMessage('create_game')
  async handleCreate(
    @MessageBody() data: { quizId: string; token: string },
    @ConnectedSocket() client: CustomSocket,
  ) {
    if (!data.token) {
      client.emit('unauthorized');
      return;
    }

    try {
      const decoded = this.jwtService.verify<{ sub: string }>(data.token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      const hostId = decoded.sub;

      const game = await this.gameService.createGameFromQuiz(
        hostId,
        data.quizId,
      );

      void client.join(game.roomCode);

      client.emit('host_registered', {
        hostToken: game.hostToken,
        roomCode: game.roomCode,
      });

      client.emit('game_created', game);
    } catch {
      client.emit('unauthorized');
    }
  }

  // ==== NEW: Step 1 Kahoot-style JOIN ====
  @SubscribeMessage('check_room')
  async handleCheckRoom(
    @MessageBody() data: { roomCode: string },
    @ConnectedSocket() client: CustomSocket,
  ) {
    const info = await this.gameService.getGameInfo(data.roomCode);

    if (!info) {
      client.emit('room_not_found');
      return;
    }

    if (info.phase !== 'WAITING') {
      client.emit('game_already_started');
      return;
    }

    if (info.isLocked) {
      client.emit('room_locked');
      return;
    }

    client.emit('room_valid', { roomCode: data.roomCode });
  }

  // ==== REFACTORED: Step 2 Kahoot-style JOIN ====
  @SubscribeMessage('join_room')
  async handleJoin(
    @MessageBody()
    data: {
      roomCode: string;
      nickname: string;
      playerToken?: string;
      avatar?: object | null;
      authToken?: string;
    },
    @ConnectedSocket() client: CustomSocket,
  ) {
    const info = await this.gameService.getGameInfo(data.roomCode);

    if (!info) {
      client.emit('room_not_found');
      return;
    }

    if (info.phase !== 'WAITING') {
      client.emit('game_already_started');
      return;
    }

    if (info.isLocked) {
      client.emit('room_locked');
      return;
    }

    const tokenToUse = data.playerToken;

    // 🔥 If playerToken exists → check if valid
    const playersList = await this.gameService.getPlayersList(data.roomCode);

    if (tokenToUse) {
      const existingPlayer = playersList.find(
        (p) => p.playerToken === tokenToUse,
      );
      if (existingPlayer) {
        // Reconnect
        await this.gameService.updatePlayerId(
          data.roomCode,
          tokenToUse,
          client.id,
        );
        client.data.playerToken = tokenToUse;
        void client.join(data.roomCode);

        client.emit('player_registered', { playerToken: tokenToUse });
        this.server.to(data.roomCode).emit('player_joined', {
          players: await this.gameService.getPlayersList(data.roomCode),
        });
        return;
      }
    }

    // New Player -> check nickname uniqueness
    const isNicknameAvailable = await this.gameService.checkAndAddNickname(
      data.roomCode,
      data.nickname,
    );
    if (!isNicknameAvailable) {
      client.emit('nickname_taken');
      return;
    }

    const token = randomUUID();
    client.data.playerToken = token;

    let userId: string | null = null;
    if (data.authToken) {
      try {
        const decoded = this.jwtService.verify<{ sub: string }>(
          data.authToken,
          {
            secret: this.configService.get<string>('JWT_SECRET'),
          },
        );
        userId = decoded.sub;
      } catch {
        // invalid token, left as guest
      }
    }

    await this.gameService.addPlayer(
      data.roomCode,
      token,
      client.id,
      data.nickname,
      data.avatar ?? null,
      userId,
    );

    void client.join(data.roomCode);

    // send token back (important)
    client.emit('player_registered', {
      playerToken: token,
    });

    this.server.to(data.roomCode).emit('player_joined', {
      players: await this.gameService.getPlayersList(data.roomCode),
    });
  }

  @SubscribeMessage('toggle_lock_room')
  async handleLock(
    @MessageBody()
    data: {
      roomCode: string;
      hostToken: string;
    },
    @ConnectedSocket() client: CustomSocket,
  ) {
    const info = await this.gameService.getGameInfo(data.roomCode);
    if (!info) return;

    if (info.hostToken !== data.hostToken) {
      client.emit('unauthorized');
      return;
    }

    const newLockState = !info.isLocked;
    await this.gameService.updateGameInfo(data.roomCode, {
      isLocked: newLockState,
    });

    this.server.to(data.roomCode).emit('room_lock_changed', {
      isLocked: newLockState,
    });
  }

  @SubscribeMessage('host_start_game')
  async handleStartGame(
    @MessageBody() data: { roomCode: string; hostToken: string },
    @ConnectedSocket() client: CustomSocket,
  ) {
    const info = await this.gameService.getGameInfo(data.roomCode);

    if (!info) return;

    if (info.hostToken !== data.hostToken) {
      client.emit('unauthorized');
      return;
    }

    await this.gameService.updateGameInfo(data.roomCode, {
      phase: 'COUNTDOWN',
    });

    this.server.to(data.roomCode).emit('phase_changed', {
      phase: 'COUNTDOWN',
    });

    // Countdown server-side
    setTimeout(() => {
      void (async () => {
        const currentInfo = await this.gameService.getGameInfo(data.roomCode);
        if (!currentInfo) return;

        const startTime = Date.now();
        await this.gameService.updateGameInfo(data.roomCode, {
          phase: 'QUESTION',
          questionStartTime: startTime,
        });

        // 🔥 MARK SESSION STARTED (ONLY ONCE)
        await this.gameService.markSessionStarted(currentInfo.sessionId);

        const questions = await this.gameService.getQuestions(data.roomCode);

        this.server.to(data.roomCode).emit('question_started', {
          question: questions[currentInfo.currentQuestionIndex],
          startTime: startTime,
          currentIndex: currentInfo.currentQuestionIndex,
          totalQuestions: questions.length,
        });

        void this.startQuestionTimer(data.roomCode);
      })();
    }, 3000);
  }

  @SubscribeMessage('submit_answer')
  async handleSubmitAnswer(
    @MessageBody()
    data: {
      roomCode: string;
      selectedOptionId: string;
    },
    @ConnectedSocket() client: CustomSocket,
  ) {
    const info = await this.gameService.getGameInfo(data.roomCode);
    if (!info) return;

    if (info.phase !== 'QUESTION') return;
    if (!info.questionStartTime) return;

    const playerToken = client.data.playerToken;
    if (!playerToken) return;

    // ATOMIC SUBMISSION (HSETNX guarantees only first answer applies)
    const responseTime = Date.now() - info.questionStartTime;

    const wasAccepted = await this.gameService.submitAnswer(
      data.roomCode,
      info.currentQuestionIndex,
      playerToken,
      data.selectedOptionId,
      responseTime,
    );

    if (!wasAccepted) return; // Prevent double answer processing further down

    // 🔥 GET ATOMIC ANSWER STATS
    const stats = await this.gameService.getAnswerStats(
      data.roomCode,
      info.currentQuestionIndex,
    );

    this.server.to(data.roomCode).emit('answer_stats', {
      stats,
    });

    client.emit('answer_received');
  }

  @SubscribeMessage('get_current_state')
  async handleGetCurrentState(
    @MessageBody() data: { roomCode: string; playerToken?: string },
    @ConnectedSocket() client: CustomSocket,
  ) {
    const info = await this.gameService.getGameInfo(data.roomCode);
    if (!info) {
      client.emit('room_not_found');
      return;
    }

    if (!client.data.playerToken && data.playerToken) {
      client.data.playerToken = data.playerToken;
    }

    void client.join(data.roomCode);

    const playersList = await this.gameService.getPlayersList(data.roomCode);

    const response: {
      phase: string;
      players: unknown[];
      isLocked: boolean;
      sessionId: string; // NEW
      title: string;
      question?: SnapshotQuestion;
      startTime?: number;
      correctOptionId?: string;
      correctOptionIds?: string[];
      rankings?: unknown[];
    } = {
      phase: info.phase,
      players: playersList,
      isLocked: info.isLocked,
      sessionId: info.sessionId, // NEW
      title: info.title,
    };

    if (info.phase === 'QUESTION' || info.phase === 'REVEAL') {
      const questions = await this.gameService.getQuestions(data.roomCode);
      const question = questions[info.currentQuestionIndex];
      response.question = question;
      response.startTime = info.questionStartTime;

      if (info.phase === 'REVEAL' && question) {
        response.correctOptionId = question.correctOptionIds[0]; // fallback for single-picker UI compatibility if needed
        response.correctOptionIds = question.correctOptionIds;
      }
    }

    if (info.phase === 'LEADERBOARD' || info.phase === 'FINISHED') {
      const leaderboard = await this.gameService.getLeaderboard(data.roomCode);
      response.rankings = leaderboard;
    }

    client.emit('current_state', response);
  }

  private async startQuestionTimer(roomCode: string) {
    const info = await this.gameService.getGameInfo(roomCode);
    if (!info) return;

    const questions = await this.gameService.getQuestions(roomCode);
    if (questions.length === 0) return;
    const questionIndex = info.currentQuestionIndex;
    const currentQuestion = questions[questionIndex];

    setTimeout(() => {
      void (async () => {
        const updatedInfo = await this.gameService.getGameInfo(roomCode);

        // 🔥 GUARD: Only proceed if we are still on the SAME question and in QUESTION phase
        if (
          !updatedInfo ||
          updatedInfo.phase !== 'QUESTION' ||
          updatedInfo.currentQuestionIndex !== questionIndex
        )
          return;

        await this.gameService.updateGameInfo(roomCode, { phase: 'REVEAL' });

        this.server.to(roomCode).emit('reveal', {
          correctOptionIds: currentQuestion.correctOptionIds,
        });

        // move to leaderboard after 3 sec
        setTimeout(() => {
          void (async () => {
            const finalInfo = await this.gameService.getGameInfo(roomCode);
            if (
              !finalInfo ||
              finalInfo.phase !== 'REVEAL' ||
              finalInfo.currentQuestionIndex !== questionIndex
            )
              return;
            await this.moveToLeaderboard(roomCode);
          })();
        }, 3000);
      })();
    }, currentQuestion.timeLimit * 1000);
  }

  private async moveToLeaderboard(roomCode: string) {
    const info = await this.gameService.getGameInfo(roomCode);
    if (!info) return;

    const questions = await this.gameService.getQuestions(roomCode);
    const questionIndex = info.currentQuestionIndex;
    const currentQuestion = questions[questionIndex];

    const playersList = await this.gameService.getPlayersList(roomCode);

    // 🔥 SCORING ATOMICALLY
    for (const player of playersList) {
      const answer = await this.gameService.getAnswer(
        roomCode,
        questionIndex,
        player.playerToken,
      );

      if (!answer) continue;

      if (currentQuestion.correctOptionIds.includes(answer.selectedOptionId)) {
        const maxScore = 1000;

        const timeFactor =
          1 - answer.responseTime / (currentQuestion.timeLimit * 1000);

        const score = Math.max(0, Math.floor(maxScore * timeFactor));

        await this.gameService.incrementScore(
          roomCode,
          player.playerToken,
          score,
        );
      }
    }

    // 🔥 SET PHASE LEADERBOARD
    await this.gameService.updateGameInfo(roomCode, { phase: 'LEADERBOARD' });

    const rankings = await this.gameService.getLeaderboard(roomCode);

    this.server.to(roomCode).emit('leaderboard', {
      rankings,
    });

    // 🔥 AFTER 3 SECONDS → NEXT QUESTION OR FINISH
    setTimeout(() => {
      void (async () => {
        const latestInfo = await this.gameService.getGameInfo(roomCode);
        if (!latestInfo) return;

        const isLastQuestion =
          latestInfo.currentQuestionIndex >= questions.length - 1;

        if (isLastQuestion) {
          await this.gameService.updateGameInfo(roomCode, {
            phase: 'FINISHED',
          });

          const finalRankings = await this.gameService.getLeaderboard(roomCode);

          this.server.to(roomCode).emit('game_finished', {
            finalRankings,
          });

          // 🔥 PERSIST TO DB + CLEAN REDIS
          await this.gameService.finalizeGame(roomCode);

          return;
        } else {
          const nextIndex = latestInfo.currentQuestionIndex + 1;
          const newStartTime = Date.now();

          await this.gameService.updateGameInfo(roomCode, {
            currentQuestionIndex: nextIndex,
            phase: 'QUESTION',
            questionStartTime: newStartTime,
          });

          this.server.to(roomCode).emit('question_started', {
            question: questions[nextIndex],
            startTime: newStartTime,
            currentIndex: nextIndex,
            totalQuestions: questions.length,
          });

          void this.startQuestionTimer(roomCode);
        }
      })();
    }, 3000);
  }

  @SubscribeMessage('force_reveal')
  async handleForceReveal(
    @MessageBody() data: { roomCode: string; hostToken: string },
  ) {
    const info = await this.gameService.getGameInfo(data.roomCode);
    if (!info || info.phase !== 'QUESTION' || info.hostToken !== data.hostToken)
      return;

    const questions = await this.gameService.getQuestions(data.roomCode);
    const questionIndex = info.currentQuestionIndex;
    const currentQuestion = questions[questionIndex];

    await this.gameService.updateGameInfo(data.roomCode, { phase: 'REVEAL' });

    this.server.to(data.roomCode).emit('reveal', {
      correctOptionIds: currentQuestion.correctOptionIds,
    });

    // move to leaderboard after 3 sec
    setTimeout(() => {
      void (async () => {
        const updatedInfo = await this.gameService.getGameInfo(data.roomCode);
        if (
          !updatedInfo ||
          updatedInfo.phase !== 'REVEAL' ||
          updatedInfo.currentQuestionIndex !== questionIndex
        )
          return;
        await this.moveToLeaderboard(data.roomCode);
      })();
    }, 3000);
  }

  @SubscribeMessage('abort_game')
  async handleAbortGame(
    @MessageBody() data: { roomCode: string; hostToken: string },
  ) {
    const info = await this.gameService.getGameInfo(data.roomCode);
    if (!info || info.hostToken !== data.hostToken) return;

    await this.gameService.updateGameInfo(data.roomCode, {
      phase: 'FINISHED',
    });

    const finalRankings = await this.gameService.getLeaderboard(data.roomCode);

    this.server.to(data.roomCode).emit('game_finished', {
      finalRankings,
    });

    // 🔥 PERSIST TO DB + CLEAN REDIS
    await this.gameService.finalizeGame(data.roomCode);
  }
}
