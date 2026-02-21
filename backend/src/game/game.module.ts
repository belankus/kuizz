import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway.js';
import { GameService } from './game.service.js';
import { RedisModule } from '../redis/redis.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [RedisModule, PrismaModule, JwtModule.register({}), ConfigModule],
  providers: [GameGateway, GameService],
})
export class GameModule {}
