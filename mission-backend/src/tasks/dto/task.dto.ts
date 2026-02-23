import { IsString, IsOptional, IsEnum, IsNumber, Min, IsDateString } from 'class-validator';
import { TaskTypeEnum, PriorityEnum, TaskStatusEnum } from '../../../generated/prisma/enums.js';

export class CreateTaskDto {
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsEnum(TaskTypeEnum)
    type: TaskTypeEnum;

    @IsOptional()
    @IsEnum(PriorityEnum)
    priority?: PriorityEnum;

    @IsOptional()
    @IsString()
    assignedToId?: string;

    @IsOptional()
    deadline?: Date;

    @IsOptional()
    @IsNumber()
    @Min(0)
    estimatedHours?: number;
}

export class UpdateTaskDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsEnum(PriorityEnum)
    priority?: PriorityEnum;

    @IsOptional()
    @IsString()
    assignedToId?: string;

    @IsOptional()
    deadline?: Date;

    @IsOptional()
    @IsNumber()
    @Min(0)
    estimatedHours?: number;

    @IsOptional()
    @IsEnum(TaskStatusEnum)
    status?: TaskStatusEnum;
}
