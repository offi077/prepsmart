import {
    IsString, IsOptional, IsEnum, IsInt, IsBoolean, IsArray, Min, MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { QuizTypeEnum, DifficultyEnum, ExamLevelEnum } from '../../../generated/prisma/enums.js';

export class CreateQuizDto {
    @IsEnum(QuizTypeEnum)
    type: QuizTypeEnum;

    @IsString()
    @MaxLength(200)
    title: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsString()
    subject: string;

    @IsInt()
    @Min(1)
    totalQuestions: number;

    @IsInt()
    @Min(1)
    duration: number; // minutes

    @IsEnum(DifficultyEnum)
    difficulty: DifficultyEnum;

    @IsEnum(ExamLevelEnum)
    examLevel: ExamLevelEnum;

    @IsOptional()
    scheduledDate?: Date;

    @IsOptional()
    @IsBoolean()
    isLocked?: boolean;

    @IsArray()
    questions: any[]; // embedded quiz questions
}

export class UpdateQuizDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsEnum(DifficultyEnum)
    difficulty?: DifficultyEnum;

    @IsOptional()
    scheduledDate?: Date;

    @IsOptional()
    @IsBoolean()
    isLocked?: boolean;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @IsOptional()
    @IsArray()
    questions?: any[];
}

export class SubmitQuizDto {
    answers: Record<string, string | string[]>;

    @IsOptional()
    timeTaken?: number;
}

export class QueryQuizzesDto {
    @IsOptional()
    @IsEnum(QuizTypeEnum)
    type?: QuizTypeEnum;

    @IsOptional()
    @IsString()
    subject?: string;

    @IsOptional()
    @IsEnum(DifficultyEnum)
    difficulty?: DifficultyEnum;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number = 20;
}
