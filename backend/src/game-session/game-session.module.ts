import { Module } from '@nestjs/common';
import { GameSessionController } from './game-session.controller.js';
import { GameSessionService } from './game-session.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [GameSessionController],
  providers: [GameSessionService],
})
export class GameSessionModule {}
