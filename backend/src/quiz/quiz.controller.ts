import { Controller, Post, Body } from '@nestjs/common';
import { QuizService } from './quiz.service.js';

@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post()
  create(@Body() body: any) {
    return this.quizService.createQuiz(body);
  }
}
