import {
  Controller,
  Post,
  Body,
  Get,
  Put,
  Param,
  Delete,
} from '@nestjs/common';
import { QuizService } from './quiz.service.js';

@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Get()
  findAll() {
    return this.quizService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.quizService.findOne(id);
  }

  @Post()
  create(@Body() body: any) {
    return this.quizService.createQuiz(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.quizService.updateQuiz(id, body);
  }

  @Delete(':id')
  async deleteQuiz(@Param('id') id: string) {
    return this.quizService.deleteQuiz(id);
  }
}
