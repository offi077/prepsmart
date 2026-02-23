import { IsString, IsOptional, IsEnum, IsArray, IsBoolean, IsInt, Min, MaxLength } from 'class-validator';
import { BlogStatusEnum } from '../../../generated/prisma/enums.js';

export class CreateBlogDto {
    @IsString()
    @MaxLength(250)
    title: string;

    @IsString()
    slug: string;

    @IsString()
    content: string; // HTML

    @IsOptional()
    @IsString()
    excerpt?: string;

    @IsString()
    category: string;

    @IsOptional()
    @IsArray()
    tags?: string[];

    @IsOptional()
    @IsString()
    featuredImage?: string;

    @IsOptional()
    @IsEnum(BlogStatusEnum)
    status?: BlogStatusEnum;

    @IsOptional()
    scheduledDate?: Date;

    @IsOptional()
    @IsInt()
    @Min(1)
    readTime?: number;

    @IsOptional()
    seoMeta?: { metaTitle?: string; metaDescription?: string; keywords?: string[] };

    @IsOptional()
    @IsBoolean()
    aiGenerated?: boolean;

    @IsOptional()
    sources?: any[];
}

export class UpdateBlogDto {
    @IsOptional() @IsString() title?: string;
    @IsOptional() @IsString() content?: string;
    @IsOptional() @IsString() excerpt?: string;
    @IsOptional() @IsString() category?: string;
    @IsOptional() @IsArray() tags?: string[];
    @IsOptional() @IsString() featuredImage?: string;
    @IsOptional() @IsEnum(BlogStatusEnum) status?: BlogStatusEnum;
    @IsOptional() scheduledDate?: Date;
    @IsOptional() seoMeta?: any;
}
