import {
    Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service.js';
import { CreatePlanDto, UpdatePlanDto, CreateSubscriptionDto } from './dto/payment.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../../generated/prisma/enums.js';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

    // ─── Public: view plans ────────────────────────────────────────────────────
    @Get('plans')
    findAllPlans() {
        return this.paymentsService.findAllPlans(true);
    }

    @Get('plans/:id')
    findOnePlan(@Param('id') id: string) {
        return this.paymentsService.findOnePlan(id);
    }

    // ─── Admin: manage plans ───────────────────────────────────────────────────
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.OWNER, UserRole.SUPER_ADMIN)
    @Get('plans/admin/all')
    findAllPlansAdmin() {
        return this.paymentsService.findAllPlans(false);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.OWNER, UserRole.SUPER_ADMIN)
    @Post('plans')
    createPlan(@Body() dto: CreatePlanDto) {
        return this.paymentsService.createPlan(dto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.OWNER, UserRole.SUPER_ADMIN)
    @Patch('plans/:id')
    updatePlan(@Param('id') id: string, @Body() dto: UpdatePlanDto) {
        return this.paymentsService.updatePlan(id, dto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.OWNER, UserRole.SUPER_ADMIN)
    @Delete('plans/:id')
    deletePlan(@Param('id') id: string) {
        return this.paymentsService.deletePlan(id);
    }

    // ─── Auth: subscriptions ────────────────────────────────────────────────────
    @UseGuards(JwtAuthGuard)
    @Get('subscription')
    getMySubscription(@Request() req: any) {
        return this.paymentsService.getMySubscription(req.user.sub);
    }

    @UseGuards(JwtAuthGuard)
    @Get('subscription/history')
    getMyHistory(@Request() req: any) {
        return this.paymentsService.getMySubscriptionHistory(req.user.sub);
    }

    @ApiBearerAuth('JWT')
    @ApiOperation({ summary: 'Subscribe to a plan' })
    @UseGuards(JwtAuthGuard)
    @Post('subscribe')
    subscribe(@Request() req: any, @Body() dto: CreateSubscriptionDto) {
        return this.paymentsService.subscribe(req.user.sub, dto);
    }

    @ApiBearerAuth('JWT')
    @ApiOperation({ summary: 'Cancel active subscription' })
    @UseGuards(JwtAuthGuard)
    @Post('cancel')
    cancel(@Request() req: any) {
        return this.paymentsService.cancelSubscription(req.user.sub);
    }

    // ─── Admin: all subscriptions & revenue ───────────────────────────────────
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.OWNER, UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @Get('subscriptions')
    getAllSubscriptions(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.paymentsService.getAllSubscriptions(
            page ? parseInt(page) : 1,
            limit ? parseInt(limit) : 20,
        );
    }

    @ApiBearerAuth('JWT')
    @ApiOperation({ summary: 'Revenue summary by plan (owner+)' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.OWNER, UserRole.SUPER_ADMIN)
    @Get('revenue')
    getRevenueSummary() {
        return this.paymentsService.getRevenueSummary();
    }
}
