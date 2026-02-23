import {
    IsString, IsOptional, IsEnum, IsInt, IsBoolean, IsArray, IsNumber, Min, MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

// ─── Course DTOs ─────────────────────────────────────────────────────────────
export class CreateCourseDto {
    @IsString()
    @MaxLength(200)
    title: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    categoryId?: string;

    @IsOptional()
    @IsArray()
    subjects?: string[];

    @IsOptional()
    @IsNumber()
    @Min(0)
    price?: number;

    @IsOptional()
    @IsBoolean()
    isPaid?: boolean;

    @IsOptional()
    @IsString()
    thumbnail?: string;

    @IsOptional()
    content?: any; // course modules JSON
}

export class UpdateCourseDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    price?: number;

    @IsOptional()
    @IsBoolean()
    isPaid?: boolean;

    @IsOptional()
    @IsString()
    thumbnail?: string;

    @IsOptional()
    content?: any;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
