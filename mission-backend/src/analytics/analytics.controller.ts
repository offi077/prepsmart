import {
    Controller, Get, Param, Query, UseGuards, Request,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../../generated/prisma/enums.js';

@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) { }

    // GET /api/analytics/me — student's own performance
    @Get('me')
    getMyPerformance(@Request() req: any) {
        return this.analyticsService.getStudentPerformance(req.user.sub);
    }

    // GET /api/analytics/student/:id — mentor/admin view a student's stats
    @Get('student/:id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.MENTOR)
    getStudentPerformance(@Param('id') id: string) {
        return this.analyticsService.getStudentPerformance(id);
    }

    // GET /api/analytics/platform — super-admin: full platform stats
    @Get('platform')
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.OWNER)
    getPlatformAnalytics() {
        return this.analyticsService.getPlatformAnalytics();
    }

    // GET /api/analytics/business — owner: revenue + business metrics
    @Get('business')
    @UseGuards(RolesGuard)
    @Roles(UserRole.OWNER)
    getBusinessAnalytics() {
        return this.analyticsService.getBusinessAnalytics();
    }

    // GET /api/analytics/leaderboard — top students overall
    @Get('leaderboard')
    getLeaderboard(
        @Query('examId') examId?: string,
        @Query('limit') limit?: string,
    ) {
        return this.analyticsService.getLeaderboard(examId, limit ? parseInt(limit) : 20);
    }
}
