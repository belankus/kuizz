import { Module } from '@nestjs/common';
import { QuestionBanksService } from './question-banks.service.js';
import { QuestionBanksController } from './question-banks.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [QuestionBanksController],
  providers: [QuestionBanksService],
  exports: [QuestionBanksService],
})
export class QuestionBanksModule {}
