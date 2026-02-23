import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';

export class CreateStudyTeamDto {
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsInt()
    @Min(2)
    @Max(50)
    maxMembers?: number;
}

export class UpdateStudyTeamDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsInt()
    @Min(2)
    @Max(50)
    maxMembers?: number;
}
