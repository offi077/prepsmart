import { IsString, IsOptional, IsEnum, IsNumber, Min, IsBoolean } from 'class-validator';

// ─── Payment Plan ─────────────────────────────────────────────────────────────
export class CreatePlanDto {
    @IsString()
    name: string;

    @IsNumber()
    @Min(0)
    price: number;

    @IsNumber()
    duration: number; // days

    features: string[];

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

export class UpdatePlanDto {
    @IsOptional() @IsString() name?: string;
    @IsOptional() @IsNumber() @Min(0) price?: number;
    @IsOptional() @IsNumber() duration?: number;
    @IsOptional() features?: string[];
    @IsOptional() @IsBoolean() isActive?: boolean;
}

// ─── Subscriptions ────────────────────────────────────────────────────────────
export class CreateSubscriptionDto {
    @IsString()
    planId: string;
}
