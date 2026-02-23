import { IsString, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { NotificationTypeEnum } from '../../../generated/prisma/enums.js';

export class CreateNotificationDto {
    @IsString()
    userId: string;

    @IsString()
    title: string;

    @IsString()
    message: string;

    @IsEnum(NotificationTypeEnum)
    type: NotificationTypeEnum;
}

export class BroadcastNotificationDto {
    @IsString()
    title: string;

    @IsString()
    message: string;

    @IsEnum(NotificationTypeEnum)
    type: NotificationTypeEnum;

    @IsOptional()
    @IsString()
    role?: string; // broadcast to all users of a role, or all if omitted
}
