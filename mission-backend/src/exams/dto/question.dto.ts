import {
    IsString,
    IsOptional,
    IsEnum,
    IsNumber,
    IsArray,
    IsUrl,
    Min,
    IsObject,
} from 'class-validator';
import { QuestionTypeEnum } from '../../../generated/prisma/enums.js';

export class CreateQuestionDto {
    @IsString()
    sectionId: string;

    @IsEnum(QuestionTypeEnum)
    type: QuestionTypeEnum;

    @IsString()
    questionText: string;

    @IsOptional()
    @IsArray()
    options?: { id: string; text: string }[]; // for MCQ / MSQ

    // correctAnswer: string for MCQ/NUMERICAL, string[] for MSQ
    correctAnswer: string | string[];

    @IsOptional()
    @IsNumber()
    @Min(0)
    marks?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    negativeMarks?: number;

    @IsOptional()
    @IsString()
    explanation?: string;

    @IsOptional()
    @IsString()
    imageUrl?: string;
}

export class UpdateQuestionDto {
    @IsOptional()
    @IsEnum(QuestionTypeEnum)
    type?: QuestionTypeEnum;

    @IsOptional()
    @IsString()
    questionText?: string;

    @IsOptional()
    @IsArray()
    options?: { id: string; text: string }[];

    @IsOptional()
    correctAnswer?: string | string[];

    @IsOptional()
    @IsNumber()
    @Min(0)
    marks?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    negativeMarks?: number;

    @IsOptional()
    @IsString()
    explanation?: string;

    @IsOptional()
    @IsString()
    imageUrl?: string;
}

// Submit exam — record answers
export class SubmitExamDto {
    // answers: { [questionId]: answerValue }
    answers: Record<string, string | string[]>;

    @IsOptional()
    timeTaken?: number; // seconds
}
