import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  BankVisibility,
  QuestionType,
  Difficulty,
} from '../../generated/prisma/client.js';

export class CreateAnswerDto {
  @IsString()
  text: string;

  @IsOptional()
  isCorrect: boolean = false;
}

export class CreateQuestionDto {
  @IsString()
  content: string;

  @IsEnum(QuestionType)
  type: QuestionType;

  @IsOptional()
  @IsEnum(Difficulty)
  difficulty?: Difficulty;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAnswerDto)
  answers: CreateAnswerDto[];
}

export class CreateQuestionBankDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(BankVisibility)
  visibility?: BankVisibility;
}

export class UpdateQuestionBankDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(BankVisibility)
  visibility?: BankVisibility;
}

export class AddQuestionToBankDto extends CreateQuestionDto {}
