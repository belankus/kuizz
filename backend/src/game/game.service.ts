import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

interface Player {
  playerId: string;
  nickname: string;
  score: number;
}

interface Question {
  question: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
  timeLimit: number; // seconds
}

interface Answer {
  selectedOptionId: string;
  responseTime: number;
}

interface GameSession {
  roomCode: string;
  hostId: string;
  phase: string;
  currentQuestionIndex: number;
  players: {
    playerId: string;
    nickname: string;
    score: number;
  }[];
  questions: Question[];
  answers: {
    [questionIndex: number]: {
      [playerId: string]: Answer;
    };
  };
  questionStartTime?: number;
  createdAt: number;
}

@Injectable()
export class GameService {
  constructor(private redis: RedisService) {}

  private key(roomCode: string) {
    return `game:${roomCode}`;
  }

  async createGame(roomCode: string, hostId: string) {
    const questions = [
      {
        question: 'What is the capital of France?',
        options: [
          { id: '1', text: 'London' },
          { id: '2', text: 'Berlin' },
          { id: '3', text: 'Paris' },
          { id: '4', text: 'Madrid' },
        ],
        correctOptionId: '3',
        timeLimit: 10,
      },
    ];

    const game: GameSession = {
      roomCode,
      hostId,
      phase: 'WAITING',
      currentQuestionIndex: 0,
      players: [],
      questions,
      answers: {},
      createdAt: Date.now(),
    };

    await this.redis.setJSON(this.key(roomCode), game);
    await this.redis.expire(this.key(roomCode), 7200);

    return game;
  }

  async getGame(roomCode: string) {
    return this.redis.getJSON<any>(this.key(roomCode));
  }

  async updateGame(roomCode: string, game: any) {
    await this.redis.setJSON(this.key(roomCode), game);
  }
}
