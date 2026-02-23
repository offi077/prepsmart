import {
    Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MentorshipService } from './mentorship.service.js';
import { CreateMentorshipSessionDto, UpdateMentorshipSessionDto } from './dto/mentorship.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../../generated/prisma/enums.js';

@ApiTags('Mentorship')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('mentorship')
export class MentorshipController {
    constructor(private readonly mentorshipService: MentorshipService) { }

    // GET /api/mentorship/my-sessions — student's sessions
    @ApiOperation({ summary: 'Get sessions I am enrolled in as a student' })
    @Get('my-sessions')
    getMyStudentSessions(
        @Request() req: any,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.mentorshipService.getStudentSessions(
            req.user.sub,
            page ? parseInt(page) : 1,
            limit ? parseInt(limit) : 20,
        );
    }

    // GET /api/mentorship/mentor-sessions — mentor's sessions
    @Get('mentor-sessions')
    @UseGuards(RolesGuard)
    @Roles(UserRole.MENTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.OWNER)
    getMentorSessions(
        @Request() req: any,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.mentorshipService.getMentorSessions(
            req.user.sub,
            page ? parseInt(page) : 1,
            limit ? parseInt(limit) : 20,
        );
    }

    // GET /api/mentorship/all — admin: all sessions
    @Get('all')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.OWNER)
    getAllSessions(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.mentorshipService.getAllSessions(
            page ? parseInt(page) : 1,
            limit ? parseInt(limit) : 20,
        );
    }

    // POST /api/mentorship — schedule session (mentor)
    @ApiOperation({ summary: 'Schedule a mentorship session (mentor only)' })
    @Post()
    @UseGuards(RolesGuard)
    @Roles(UserRole.MENTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.OWNER)
    create(@Request() req: any, @Body() dto: CreateMentorshipSessionDto) {
        return this.mentorshipService.create(req.user.sub, dto);
    }

    // GET /api/mentorship/:id — get session detail
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.mentorshipService.findOne(id);
    }

    // PATCH /api/mentorship/:id — update session (mentor/admin)
    @Patch(':id')
    update(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateMentorshipSessionDto) {
        const isAdmin = [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.OWNER].includes(req.user.role);
        return this.mentorshipService.update(req.user.sub, id, dto, isAdmin);
    }

    // DELETE /api/mentorship/:id — cancel session (mentor/admin)
    @Delete(':id')
    remove(@Request() req: any, @Param('id') id: string) {
        const isAdmin = [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.OWNER].includes(req.user.role);
        return this.mentorshipService.remove(req.user.sub, id, isAdmin);
    }
}
