import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { QuestionBanksService } from './question-banks.service.js';
import {
  CreateQuestionBankDto,
  UpdateQuestionBankDto,
  AddQuestionToBankDto,
} from './dto/question-bank.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';

@Controller('question-banks')
@UseGuards(JwtAuthGuard)
export class QuestionBanksController {
  constructor(private readonly questionBanksService: QuestionBanksService) {}

  @Post()
  create(
    @CurrentUser() user: { id: string },
    @Body() createQuestionBankDto: CreateQuestionBankDto,
  ) {
    return this.questionBanksService.create(createQuestionBankDto, user.id);
  }

  @Get()
  findAll(@CurrentUser() user: { id: string }) {
    return this.questionBanksService.findAll(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.questionBanksService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateQuestionBankDto: UpdateQuestionBankDto,
  ) {
    return this.questionBanksService.update(id, updateQuestionBankDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.questionBanksService.remove(id);
  }

  @Post(':id/questions')
  addQuestion(
    @Param('id') id: string,
    @Body() addQuestionToBankDto: AddQuestionToBankDto,
  ) {
    return this.questionBanksService.addQuestion(id, addQuestionToBankDto);
  }

  @Delete(':id/questions/:questionId')
  removeQuestion(
    @Param('id') id: string,
    @Param('questionId') questionId: string,
  ) {
    return this.questionBanksService.removeQuestion(id, questionId);
  }
}
