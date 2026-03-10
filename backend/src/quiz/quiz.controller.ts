import {
  Controller,
  Post,
  Body,
  Get,
  Put,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  HttpException,
  HttpStatus,
  StreamableFile,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { QuizService } from './quiz.service.js';
import type { AddQuestionDto } from './quiz.service.js';
import { CreateQuizDto, UpdateQuizDto } from '../lib/dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import {
  canViewQuiz,
  canEditQuiz,
  canDeleteQuiz,
} from '../lib/permissions/quiz.permissions.js';
import { ForbiddenException } from '@nestjs/common';

@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@CurrentUser() user: { id: string }) {
    return this.quizService.findAll(user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    const quiz = await this.quizService.findOne(id);
    if (!canViewQuiz(quiz, user.id)) {
      throw new ForbiddenException(
        'You do not have permission to view this quiz',
      );
    }
    return quiz;
  }

  @Get(':id/export')
  async exportQuiz(@Param('id') id: string) {
    try {
      const buffer = await this.quizService.exportQuiz(id);

      return new StreamableFile(buffer, {
        disposition: `attachment; filename=quiz-${id}.xlsx`,
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
    } catch (error) {
      throw new HttpException(
        error instanceof Error ? error.message : 'Export failed',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@CurrentUser() user: { id: string }, @Body() body: CreateQuizDto) {
    return this.quizService.createQuiz(body, user.id);
  }

  @Post('import')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async importQuiz(
    @CurrentUser() user: { id: string },
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    return this.quizService.importQuiz(file, user.id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateQuiz(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() body: UpdateQuizDto,
  ) {
    const quiz = await this.quizService.findOne(id);
    if (!canEditQuiz(quiz, user.id)) {
      throw new ForbiddenException('Only the owner can update this quiz');
    }
    return this.quizService.updateQuiz(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteQuiz(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
  ) {
    const quiz = await this.quizService.findOne(id);
    if (!canDeleteQuiz(quiz, user.id)) {
      throw new ForbiddenException('Only the owner can delete this quiz');
    }
    return this.quizService.deleteQuiz(id);
  }

  @Post(':id/clone')
  @UseGuards(JwtAuthGuard)
  async cloneQuiz(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.quizService.cloneQuiz(id, user.id);
  }

  @Put(':id/favorite')
  @UseGuards(JwtAuthGuard)
  async toggleFavorite(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
  ) {
    const quiz = await this.quizService.findOne(id);
    if (!canEditQuiz(quiz, user.id)) {
      throw new ForbiddenException('Only the owner can favorite this quiz');
    }
    return await this.quizService.toggleFavorite(id);
  }

  @Post(':id/questions')
  @UseGuards(JwtAuthGuard)
  async addQuestion(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() body: AddQuestionDto,
  ) {
    const quiz = await this.quizService.findOne(id);
    if (!canEditQuiz(quiz, user.id)) {
      throw new ForbiddenException(
        'Only the owner can add questions to this quiz',
      );
    }
    return this.quizService.addQuestion(id, body);
  }

  @Delete(':id/questions/:questionId')
  @UseGuards(JwtAuthGuard)
  async deleteQuestion(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Param('questionId') questionId: string,
  ) {
    const quiz = await this.quizService.findOne(id);
    if (!canEditQuiz(quiz, user.id)) {
      throw new ForbiddenException(
        'Only the owner can delete questions from this quiz',
      );
    }
    return this.quizService.removeQuestion(id, questionId);
  }
}
