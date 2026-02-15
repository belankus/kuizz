import { Module } from '@nestjs/common';
import { GameModule } from './game/game.module.js';
import { RedisModule } from './redis/redis.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { QuizModule } from './quiz/quiz.module.js';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GameModule,
    RedisModule,
    PrismaModule,
    QuizModule,
  ],
})
export class AppModule {}
