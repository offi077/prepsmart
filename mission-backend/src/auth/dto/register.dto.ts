import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';

export enum RegisterRole {
    STUDENT = 'STUDENT',
    MENTOR = 'MENTOR',
}

export class RegisterDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsOptional()
    @IsEnum(RegisterRole)
    role?: RegisterRole;

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
}
