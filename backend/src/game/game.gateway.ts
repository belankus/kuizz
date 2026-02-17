import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService } from './game.service.js';
import { randomUUID } from 'crypto';

type Player = {
  playerId: string;
  playerToken: string;
  nickname: string;
  score: number;
};

@WebSocketGateway({
  cors: { origin: '*' },
})
export class GameGateway {
  @WebSocketServer()
  server: Server;

  constructor(private gameService: GameService) {}

  @SubscribeMessage('create_game')
  async handleCreate(
    @MessageBody() data: { quizId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const game = await this.gameService.createGameFromQuiz(
      client.id,
      data.quizId,
    );

    client.join(game.roomCode);

    client.emit('host_registered', {
      hostToken: game.hostToken,
      roomCode: game.roomCode,
    });

    client.emit('game_created', game);
  }

  @SubscribeMessage('join_room')
  async handleJoin(
    @MessageBody()
    data: { roomCode: string; nickname: string; playerToken?: string },
    @ConnectedSocket() client: Socket,
  ) {
    const game = await this.gameService.getGame(data.roomCode);

    if (!game) {
      client.emit('room_not_found');
      return;
    }

    if (game.phase !== 'WAITING') {
      client.emit('game_already_started');
      return;
    }

    if (game.isLocked) {
      client.emit('room_locked');
      return;
    }

    let player: Player | undefined;
    // 🔥 If playerToken exists → try reconnect
    if (data.playerToken) {
      player = game.players.find((p) => p.playerToken === data.playerToken);
    }

    if (player) {
      // reconnect
      player.playerId = client.id;
    } else {
      // new player
      const token = randomUUID();

      player = {
        playerId: client.id,
        playerToken: token,
        nickname: data.nickname,
        score: 0,
      };

      game.players.push(player);
    }

    // 🔥 PENTING
    client.data.playerToken = player.playerToken;

    await this.gameService.updateGame(data.roomCode, game);

    client.join(data.roomCode);

    // send token back (important)
    client.emit('player_registered', {
      playerToken: player.playerToken,
    });

    this.server.to(data.roomCode).emit('player_joined', {
      players: game.players,
    });
  }

  @SubscribeMessage('toggle_lock_room')
  async handleLock(
    @MessageBody()
    data: {
      roomCode: string;
      hostToken: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const game = await this.gameService.getGame(data.roomCode);
    if (!game) return;

    if (game.hostToken !== data.hostToken) {
      client.emit('unauthorized');
      return;
    }

    game.isLocked = !game.isLocked;

    await this.gameService.updateGame(data.roomCode, game);

    this.server.to(data.roomCode).emit('room_lock_changed', {
      isLocked: game.isLocked,
    });
  }

  @SubscribeMessage('host_start_game')
  async handleStartGame(
    @MessageBody() data: { roomCode: string; hostToken: string },
    @ConnectedSocket() client: Socket,
  ) {
    const game = await this.gameService.getGame(data.roomCode);

    if (!game) return;

    if (game.hostToken !== data.hostToken) {
      client.emit('unauthorized');
      return;
    }

    game.phase = 'COUNTDOWN';
    await this.gameService.updateGame(data.roomCode, game);

    this.server.to(data.roomCode).emit('phase_changed', {
      phase: 'COUNTDOWN',
    });

    // Countdown server-side
    setTimeout(async () => {
      const updatedGame = await this.gameService.getGame(data.roomCode);
      if (!updatedGame) return;

      updatedGame.phase = 'QUESTION';
      updatedGame.questionStartTime = Date.now();

      await this.gameService.updateGame(data.roomCode, updatedGame);

      // 🔥 MARK SESSION STARTED (ONLY ONCE)
      await this.gameService.markSessionStarted(updatedGame.sessionId);

      this.server.to(data.roomCode).emit('question_started', {
        question: updatedGame.questions[updatedGame.currentQuestionIndex],
        startTime: updatedGame.questionStartTime,
        currentIndex: updatedGame.currentQuestionIndex,
        totalQuestions: updatedGame.questions.length,
      });

      this.startQuestionTimer(data.roomCode);
    }, 3000);
  }

  @SubscribeMessage('submit_answer')
  async handleSubmitAnswer(
    @MessageBody()
    data: {
      roomCode: string;
      selectedOptionId: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const game = await this.gameService.getGame(data.roomCode);
    if (!game) return;

    if (game.phase !== 'QUESTION') return;
    if (!game.questionStartTime) return;

    const playerToken = client.data.playerToken;
    if (!playerToken) return;
    const playerExists = game.players.find(
      (p) => p.playerToken === playerToken,
    );
    if (!playerExists) return;

    const questionIndex = game.currentQuestionIndex;

    if (!game.answers[questionIndex]) {
      game.answers[questionIndex] = {};
    }

    // prevent double answer
    if (game.answers[questionIndex][playerToken]) return;

    const responseTime = Date.now() - game.questionStartTime;

    game.answers[questionIndex][playerToken] = {
      selectedOptionId: data.selectedOptionId,
      responseTime,
    };

    await this.gameService.updateGame(data.roomCode, game);

    // 🔥 BUILD ANSWER STATS
    const stats: Record<string, number> = {};

    for (const answer of Object.values(game.answers[questionIndex])) {
      const typedAnswer = answer as { selectedOptionId: string };
      stats[typedAnswer.selectedOptionId] =
        (stats[typedAnswer.selectedOptionId] || 0) + 1;
    }

    this.server.to(data.roomCode).emit('answer_stats', {
      stats,
    });

    client.emit('answer_received');
  }

  @SubscribeMessage('get_current_state')
  async handleGetCurrentState(
    @MessageBody() data: { roomCode: string; playerToken?: string },
    @ConnectedSocket() client: Socket,
  ) {
    const game = await this.gameService.getGame(data.roomCode);
    if (!game) {
      client.emit('room_not_found');
      return;
    }

    if (!client.data.playerToken && data.playerToken) {
      client.data.playerToken = data.playerToken;
    }

    client.join(data.roomCode);

    const response: any = {
      phase: game.phase,
      players: game.players,
    };

    if (game.phase === 'QUESTION') {
      response.question = game.questions[game.currentQuestionIndex];
      response.startTime = game.questionStartTime;
    }

    if (game.phase === 'REVEAL') {
      const question = game.questions[game.currentQuestionIndex];
      response.question = question;
      response.correctOptionId = question.correctOptionId;
    }

    if (game.phase === 'LEADERBOARD') {
      response.rankings = [...game.players].sort((a, b) => b.score - a.score);
    }

    if (game.phase === 'FINISHED') {
      const rankings = [...game.players].sort((a, b) => b.score - a.score);

      response.rankings = rankings;
    }

    client.emit('current_state', response);
  }

  private async startQuestionTimer(roomCode: string) {
    const game = await this.gameService.getGame(roomCode);
    if (!game) return;

    const currentQuestion = game.questions[game.currentQuestionIndex];

    setTimeout(async () => {
      const updatedGame = await this.gameService.getGame(roomCode);

      if (!updatedGame || updatedGame.phase !== 'QUESTION') return;

      updatedGame.phase = 'REVEAL';

      await this.gameService.updateGame(roomCode, updatedGame);

      this.server.to(roomCode).emit('reveal', {
        correctOptionId: currentQuestion.correctOptionId,
      });

      // move to leaderboard after 3 sec
      setTimeout(async () => {
        await this.moveToLeaderboard(roomCode);
      }, 3000);
    }, currentQuestion.timeLimit * 1000);
  }

  private async moveToLeaderboard(roomCode: string) {
    const game = await this.gameService.getGame(roomCode);
    if (!game) return;

    const questionIndex = game.currentQuestionIndex;
    const currentQuestion = game.questions[questionIndex];
    const answers = game.answers[questionIndex] || {};

    // 🔥 SCORING
    for (const player of game.players) {
      const answer = answers[player.playerToken];

      if (!answer) continue;

      if (answer.selectedOptionId === currentQuestion.correctOptionId) {
        const maxScore = 1000;

        const timeFactor =
          1 - answer.responseTime / (currentQuestion.timeLimit * 1000);

        const score = Math.max(0, Math.floor(maxScore * timeFactor));

        player.score += score;
      }
    }

    // 🔥 SET PHASE LEADERBOARD
    game.phase = 'LEADERBOARD';
    await this.gameService.updateGame(roomCode, game);

    const rankings = [...game.players].sort((a, b) => b.score - a.score);

    this.server.to(roomCode).emit('leaderboard', {
      rankings,
    });

    // 🔥 AFTER 3 SECONDS → NEXT QUESTION OR FINISH
    setTimeout(async () => {
      const updatedGame = await this.gameService.getGame(roomCode);
      if (!updatedGame) return;

      const isLastQuestion =
        updatedGame.currentQuestionIndex >= updatedGame.questions.length - 1;

      if (isLastQuestion) {
        updatedGame.phase = 'FINISHED';

        await this.gameService.updateGame(roomCode, updatedGame);

        this.server.to(roomCode).emit('game_finished', {
          finalRankings: rankings,
        });

        // 🔥 PERSIST TO DB + CLEAN REDIS
        await this.gameService.finalizeGame(roomCode);

        return;
      } else {
        updatedGame.currentQuestionIndex += 1;
        updatedGame.phase = 'QUESTION';
        updatedGame.questionStartTime = Date.now();

        await this.gameService.updateGame(roomCode, updatedGame);

        this.server.to(roomCode).emit('question_started', {
          question: updatedGame.questions[updatedGame.currentQuestionIndex],
          startTime: updatedGame.questionStartTime,
          currentIndex: updatedGame.currentQuestionIndex,
          totalQuestions: updatedGame.questions.length,
        });

        this.startQuestionTimer(roomCode);
      }
    }, 3000);
  }
}
