import { Module } from '@nestjs/common';
import { GameModule } from './game/game.module.js';
import { RedisModule } from './redis/redis.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { QuizModule } from './quiz/quiz.module.js';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GameModule,
    RedisModule,
    PrismaModule,
    QuizModule,
    AuthModule,
    UsersModule,
  ],
})
export class AppModule {}
