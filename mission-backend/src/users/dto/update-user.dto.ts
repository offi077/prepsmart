import {
    IsString,
    IsOptional,
    IsEnum,
    IsUrl,
    MaxLength,
} from 'class-validator';
import { UserRole, UserStatus, EmployeeCategoryEnum } from '../../../generated/prisma/enums.js';

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    @MaxLength(100)
    name?: string;

    @IsOptional()
    @IsString()
    avatar?: string;

    @IsOptional()
    @IsString()
    targetExam?: string;

    @IsOptional()
    @IsString()
    secondaryExam?: string;

    @IsOptional()
    @IsString()
    examCategory?: string;

    @IsOptional()
    @IsString()
    state?: string;

    @IsOptional()
    @IsEnum(EmployeeCategoryEnum)
    employeeCategory?: EmployeeCategoryEnum;
}

export class AdminUpdateUserDto extends UpdateUserDto {
    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;

    @IsOptional()
    @IsEnum(UserStatus)
    status?: UserStatus;
}
