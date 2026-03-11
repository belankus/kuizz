import { Module } from '@nestjs/common';
import { GameModule } from './game/game.module.js';
import { RedisModule } from './redis/redis.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { QuizModule } from './quiz/quiz.module.js';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { GameSessionModule } from './game-session/game-session.module.js';
import { DashboardModule } from './dashboard/dashboard.module.js';
import { PingModule } from './ping/ping.module.js';
import { CollectionsModule } from './collections/collections.module.js';
import { CollectionItemsModule } from './collection-items/collection-items.module.js';
import { QuestionBanksModule } from './question-banks/question-banks.module.js';
import { TemplatesModule } from './templates/templates.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PingModule,
    GameModule,
    RedisModule,
    PrismaModule,
    QuizModule,
    AuthModule,
    UsersModule,
    GameSessionModule,
    DashboardModule,
    CollectionsModule,
    CollectionItemsModule,
    QuestionBanksModule,
    TemplatesModule,
  ],
})
export class AppModule {}
