import { IsString, IsOptional, IsArray, IsBoolean, IsEnum, MaxLength } from 'class-validator';

// ─── Current Affairs ──────────────────────────────────────────────────────────
export class CreateCurrentAffairDto {
    @IsString()
    @MaxLength(250)
    title: string;

    @IsString()
    content: string;

    @IsString()
    topic: string;

    date: Date;

    @IsString()
    category: string;

    @IsOptional()
    @IsArray()
    tags?: string[];

    @IsOptional()
    @IsString()
    imageUrl?: string;
}

export class UpdateCurrentAffairDto {
    @IsOptional() @IsString() title?: string;
    @IsOptional() @IsString() content?: string;
    @IsOptional() @IsString() topic?: string;
    @IsOptional() date?: Date;
    @IsOptional() @IsString() category?: string;
    @IsOptional() @IsArray() tags?: string[];
    @IsOptional() @IsString() imageUrl?: string;
    @IsOptional() @IsBoolean() isActive?: boolean;
}

// ─── Downloads ────────────────────────────────────────────────────────────────
export class CreateDownloadDto {
    @IsString()
    @MaxLength(200)
    title: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsString()
    fileUrl: string;

    @IsString()
    category: string;

    @IsString()
    fileType: string; // pdf, doc, etc.

    @IsOptional()
    fileSize?: number;
}

export class UpdateDownloadDto {
    @IsOptional() @IsString() title?: string;
    @IsOptional() @IsString() description?: string;
    @IsOptional() @IsString() fileUrl?: string;
    @IsOptional() @IsString() category?: string;
    @IsOptional() @IsBoolean() isActive?: boolean;
}
