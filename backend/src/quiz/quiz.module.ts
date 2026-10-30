import { Module } from '@nestjs/common';
import { QuizController } from './quiz.controller.js';
import { QuizService } from './quiz.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { JwtService } from '@nestjs/jwt/dist/index.js';

@Module({
  controllers: [QuizController],
  providers: [QuizService, PrismaService, JwtService],
})
export class QuizModule {}
