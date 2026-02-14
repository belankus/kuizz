import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService } from './game.service';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class GameGateway {
  @WebSocketServer()
  server: Server;

  constructor(private gameService: GameService) {}

  @SubscribeMessage('create_game')
  async handleCreate(
    @MessageBody() data: { roomCode: string },
    @ConnectedSocket() client: Socket,
  ) {
    const game = await this.gameService.createGame(data.roomCode, client.id);

    client.join(data.roomCode);
    client.emit('game_created', game);
  }

  @SubscribeMessage('join_room')
  async handleJoin(
    @MessageBody() data: { roomCode: string; nickname: string },
    @ConnectedSocket() client: Socket,
  ) {
    const game = await this.gameService.getGame(data.roomCode);

    if (!game) {
      client.emit('error', { message: 'Room not found' });
      return;
    }

    if (game.phase !== 'WAITING') {
      client.emit('error', { message: 'Game already started' });
      return;
    }

    const player = {
      playerId: client.id,
      nickname: data.nickname,
      score: 0,
    };

    game.players.push(player);

    await this.gameService.updateGame(data.roomCode, game);

    client.join(data.roomCode);

    this.server.to(data.roomCode).emit('player_joined', {
      players: game.players,
    });
  }

  @SubscribeMessage('host_start_game')
  async handleStartGame(
    @MessageBody() data: { roomCode: string },
    @ConnectedSocket() client: Socket,
  ) {
    const game = await this.gameService.getGame(data.roomCode);

    if (!game) return;

    if (game.hostId !== client.id) {
      client.emit('error', { message: 'Not host' });
      return;
    }

    game.phase = 'COUNTDOWN';
    await this.gameService.updateGame(data.roomCode, game);

    this.server.to(data.roomCode).emit('phase_changed', {
      phase: 'COUNTDOWN',
    });

    // Countdown server-side
    setTimeout(async () => {
      game.phase = 'QUESTION';
      game.questionStartTime = Date.now();

      await this.gameService.updateGame(data.roomCode, game);

      this.server.to(data.roomCode).emit('question_started', {
        question: game.questions[game.currentQuestionIndex],
      });

      // start question timer
      this.startQuestionTimer(data.roomCode);
    }, 3000);
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

    const questionIndex = game.currentQuestionIndex;

    if (!game.answers[questionIndex]) {
      game.answers[questionIndex] = {};
    }

    // prevent double answer
    if (game.answers[questionIndex][client.id]) return;

    const responseTime = Date.now() - game.questionStartTime;

    game.answers[questionIndex][client.id] = {
      selectedOptionId: data.selectedOptionId,
      responseTime,
    };

    await this.gameService.updateGame(data.roomCode, game);

    client.emit('answer_received');
  }

  private async moveToLeaderboard(roomCode: string) {
    const game = await this.gameService.getGame(roomCode);
    if (!game) return;

    const questionIndex = game.currentQuestionIndex;

    const currentQuestion = game.questions[questionIndex];

    const answers = game.answers[questionIndex] || {};

    for (const player of game.players) {
      const answer = answers[player.playerId];

      if (!answer) continue;

      if (answer.selectedOptionId === currentQuestion.correctOptionId) {
        const maxScore = 1000;
        const timeFactor =
          1 - answer.responseTime / (currentQuestion.timeLimit * 1000);

        const score = Math.max(0, Math.floor(maxScore * timeFactor));

        player.score += score;
      }
    }

    game.phase = 'LEADERBOARD';

    await this.gameService.updateGame(roomCode, game);

    const rankings = [...game.players].sort((a, b) => b.score - a.score);

    this.server.to(roomCode).emit('leaderboard', {
      rankings,
    });
  }
}
