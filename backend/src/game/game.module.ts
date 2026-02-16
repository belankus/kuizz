import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway.js';
import { GameService } from './game.service.js';
import { RedisModule } from '../redis/redis.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [RedisModule, PrismaModule],
  providers: [GameGateway, GameService],
})
export class GameModule {}
