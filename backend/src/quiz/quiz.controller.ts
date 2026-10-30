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
  Headers
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { QuizService } from './quiz.service.js';
import { CreateQuizDto, UpdateQuizDto } from '../lib/dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';

@Controller('quiz')
export class QuizController {
  constructor(
    private readonly quizService: QuizService
  ) { }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@CurrentUser() user: { id: string }) {
    return this.quizService.findAll(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Headers('authorization') authHeader?: string) {
    return this.quizService.findOneWithAuthHeader(id, authHeader);
  }

  @Get(':id/export')
  @UseGuards(JwtAuthGuard)
  async exportQuiz(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    try {
      const buffer = await this.quizService.exportQuiz(id, user.id);

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
  async updateQuiz(@Param('id') id: string, @Body() body: UpdateQuizDto, @CurrentUser() user: { id: string }) {
    return this.quizService.updateQuiz(id, body, user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteQuiz(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.quizService.deleteQuiz(id, user.id);
  }

  @Put(':id/favorite')
  @UseGuards(JwtAuthGuard)
  async toggleFavorite(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return await this.quizService.toggleFavorite(id, user.id);
  }

  @Post(':id/share')
  @UseGuards(JwtAuthGuard)
  async shareQuiz(
    @Param('id') quizId: string,
    @Body('email') email: string,
    @CurrentUser() user: { id: string }
  ) {
    if (!email || typeof email !== 'string') {
      throw new BadRequestException("Email address is required and must be a type of string");
    }

    return this.quizService.shareQuizWithEmail(quizId, email, user.id);
  }

  @Delete(':id/share/:userId')
  @UseGuards(JwtAuthGuard)
  async unshareQuiz(
    @Param('id') quizId: string,
    @Param('userId') targetUserId: string,
    @CurrentUser() user: { id: string }
  ) {
    return this.quizService.unshareQuizWithUser(
      quizId,
      targetUserId,
      user.id
    );
  }
}
