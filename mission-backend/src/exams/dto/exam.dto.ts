import {
    IsString,
    IsOptional,
    IsEnum,
    IsInt,
    IsBoolean,
    IsArray,
    Min,
    MaxLength,
} from 'class-validator';
import { ExamLevelEnum } from '../../../generated/prisma/enums.js';

// ─── Create Exam ────────────────────────────────────────────────────────────
export class CreateExamDto {
    @IsString()
    @MaxLength(200)
    title: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsString()
    categoryId: string;

    @IsEnum(ExamLevelEnum)
    examLevel: ExamLevelEnum;

    @IsInt()
    @Min(1)
    totalDuration: number; // minutes

    @IsInt()
    @Min(1)
    totalQuestions: number;

    @IsArray()
    instructions: string[];

    @IsArray()
    languages: string[];
}

export class UpdateExamDto {
    @IsOptional()
    @IsString()
    @MaxLength(200)
    title?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsEnum(ExamLevelEnum)
    examLevel?: ExamLevelEnum;

    @IsOptional()
    @IsInt()
    @Min(1)
    totalDuration?: number;

    @IsOptional()
    @IsInt()
    @Min(1)
    totalQuestions?: number;

    @IsOptional()
    @IsArray()
    instructions?: string[];

    @IsOptional()
    @IsArray()
    languages?: string[];

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

// ─── Exam Section ────────────────────────────────────────────────────────────
export class CreateSectionDto {
    @IsString()
    @MaxLength(100)
    name: string;

    @IsInt()
    @Min(1)
    questionsCount: number;

    @IsOptional()
    @IsInt()
    @Min(1)
    duration?: number; // minutes
}

export class UpdateSectionDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    questionsCount?: number;

    @IsOptional()
    @IsInt()
    @Min(1)
    duration?: number;
}
