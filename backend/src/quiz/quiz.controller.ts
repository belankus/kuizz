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
import { CreateQuizDto, UpdateQuizDto } from '../lib/dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';

@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@CurrentUser() user: { id: string }) {
    return this.quizService.findAll(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.quizService.findOne(id);
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
  async updateQuiz(@Param('id') id: string, @Body() body: UpdateQuizDto) {
    return this.quizService.updateQuiz(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteQuiz(@Param('id') id: string) {
    return this.quizService.deleteQuiz(id);
  }

  @Put(':id/favorite')
  @UseGuards(JwtAuthGuard)
  async toggleFavorite(@Param('id') id: string) {
    return await this.quizService.toggleFavorite(id);
  }
}
