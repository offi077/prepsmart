import { IsString, IsOptional, IsEnum, IsInt, Min } from 'class-validator';
import { SessionStatusEnum } from '../../../generated/prisma/enums.js';

export class CreateMentorshipSessionDto {
    @IsString()
    studentId: string;

    scheduledAt: Date;

    @IsInt()
    @Min(15)
    duration: number; // minutes

    @IsOptional()
    @IsString()
    notes?: string;
}

export class UpdateMentorshipSessionDto {
    @IsOptional()
    scheduledAt?: Date;

    @IsOptional()
    @IsInt()
    @Min(15)
    duration?: number;

    @IsOptional()
    @IsEnum(SessionStatusEnum)
    status?: SessionStatusEnum;

    @IsOptional()
    @IsString()
    notes?: string;
}
