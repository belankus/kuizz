import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service.js';
import { randomUUID } from 'crypto';

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
    const hostToken = randomUUID();
    const questions = [
      {
        question: 'Capital of France?',
        options: [
          { id: '1', text: 'London' },
          { id: '2', text: 'Berlin' },
          { id: '3', text: 'Paris' },
          { id: '4', text: 'Madrid' },
        ],
        correctOptionId: '3',
        timeLimit: 8,
      },
      {
        question: '2 + 2 = ?',
        options: [
          { id: '1', text: '3' },
          { id: '2', text: '4' },
          { id: '3', text: '5' },
          { id: '4', text: '6' },
        ],
        correctOptionId: '2',
        timeLimit: 6,
      },
      {
        question: 'Color of the sky?',
        options: [
          { id: '1', text: 'Blue' },
          { id: '2', text: 'Green' },
          { id: '3', text: 'Red' },
          { id: '4', text: 'Yellow' },
        ],
        correctOptionId: '1',
        timeLimit: 7,
      },
    ];

    const game: GameSession = {
      roomCode,
      hostId,
      hostToken,
      isLocked: false,
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
