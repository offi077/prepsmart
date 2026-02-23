import {
    Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StudyTeamsService } from './study-teams.service.js';
import { CreateStudyTeamDto, UpdateStudyTeamDto } from './dto/study-team.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../../generated/prisma/enums.js';

@ApiTags('Study Teams')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('study-teams')
export class StudyTeamsController {
    constructor(private readonly studyTeamsService: StudyTeamsService) { }

    // GET /api/study-teams/my — my teams
    @ApiOperation({ summary: 'Get all teams I am a member of' })
    @Get('my')
    getMyTeams(@Request() req: any) {
        return this.studyTeamsService.getMyTeams(req.user.sub);
    }

    // POST /api/study-teams — create team
    @ApiOperation({ summary: 'Create a study team (creator auto-added as leader)' })
    @Post()
    create(@Request() req: any, @Body() dto: CreateStudyTeamDto) {
        return this.studyTeamsService.create(req.user.sub, dto);
    }

    // GET /api/study-teams — list all active teams
    @Get()
    findAll(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.studyTeamsService.findAll(
            page ? parseInt(page) : 1,
            limit ? parseInt(limit) : 20,
        );
    }

    // GET /api/study-teams/:id — get team details
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.studyTeamsService.findOne(id);
    }

    // PATCH /api/study-teams/:id — update (leader or admin)
    @Patch(':id')
    update(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateStudyTeamDto) {
        const isAdmin = [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.OWNER].includes(req.user.role);
        return this.studyTeamsService.update(req.user.sub, id, dto, isAdmin);
    }

    // DELETE /api/study-teams/:id — delete (leader or admin)
    @Delete(':id')
    remove(@Request() req: any, @Param('id') id: string) {
        const isAdmin = [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.OWNER].includes(req.user.role);
        return this.studyTeamsService.remove(req.user.sub, id, isAdmin);
    }

    // POST /api/study-teams/:id/join — join a team
    @Post(':id/join')
    join(@Request() req: any, @Param('id') teamId: string) {
        return this.studyTeamsService.join(req.user.sub, teamId);
    }

    // POST /api/study-teams/:id/leave — leave a team
    @Post(':id/leave')
    leave(@Request() req: any, @Param('id') teamId: string) {
        return this.studyTeamsService.leave(req.user.sub, teamId);
    }

    // DELETE /api/study-teams/:id/members/:userId — kick member (leader/admin)
    @Delete(':id/members/:userId')
    kickMember(
        @Request() req: any,
        @Param('id') teamId: string,
        @Param('userId') targetUserId: string,
    ) {
        const isAdmin = [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.OWNER].includes(req.user.role);
        return this.studyTeamsService.kickMember(req.user.sub, teamId, targetUserId, isAdmin);
    }
}
