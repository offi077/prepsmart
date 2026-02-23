import {
    Injectable, NotFoundException, BadRequestException, ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateStudyTeamDto, UpdateStudyTeamDto } from './dto/study-team.dto.js';

@Injectable()
export class StudyTeamsService {
    constructor(private readonly prisma: PrismaService) { }

    // ─── Create team ─────────────────────────────────────────────────────────
    async create(userId: string, dto: CreateStudyTeamDto) {
        const team = await this.prisma.studyTeam.create({
            data: {
                ...dto,
                createdById: userId,
                members: {
                    create: { userId, role: 'leader' },
                },
            },
            include: { members: { include: { user: { select: { id: true, name: true, avatar: true } } } } },
        });
        return team;
    }

    // ─── List all active teams ────────────────────────────────────────────────
    async findAll(page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.prisma.studyTeam.findMany({
                where: { isActive: true },
                skip, take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: { select: { members: true } },
                    createdBy: { select: { id: true, name: true, avatar: true } },
                },
            }),
            this.prisma.studyTeam.count({ where: { isActive: true } }),
        ]);
        return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    }

    // ─── Get one team ─────────────────────────────────────────────────────────
    async findOne(id: string) {
        const team = await this.prisma.studyTeam.findUnique({
            where: { id },
            include: {
                members: { include: { user: { select: { id: true, name: true, avatar: true } } } },
                createdBy: { select: { id: true, name: true, avatar: true } },
            },
        });
        if (!team) throw new NotFoundException('Study team not found');
        return team;
    }

    // ─── Update team (leader/admin only) ─────────────────────────────────────
    async update(userId: string, id: string, dto: UpdateStudyTeamDto, isAdmin: boolean) {
        const team = await this.findOne(id);
        if (!isAdmin && team.createdById !== userId) {
            throw new ForbiddenException('Only the team leader or admin can update');
        }
        return this.prisma.studyTeam.update({ where: { id }, data: dto });
    }

    // ─── Delete team (leader/admin only) ─────────────────────────────────────
    async remove(userId: string, id: string, isAdmin: boolean) {
        const team = await this.findOne(id);
        if (!isAdmin && team.createdById !== userId) {
            throw new ForbiddenException('Only the team leader or admin can delete');
        }
        await this.prisma.studyTeam.delete({ where: { id } });
        return { message: 'Team deleted' };
    }

    // ─── Join team ───────────────────────────────────────────────────────────
    async join(userId: string, teamId: string) {
        const team = await this.findOne(teamId);
        const memberCount = await this.prisma.studyTeamMember.count({ where: { teamId } });
        if (memberCount >= team.maxMembers) {
            throw new BadRequestException('Team is full');
        }
        const existing = await this.prisma.studyTeamMember.findUnique({
            where: { teamId_userId: { teamId, userId } },
        });
        if (existing) throw new BadRequestException('Already a member');

        return this.prisma.studyTeamMember.create({
            data: { teamId, userId },
            include: { user: { select: { id: true, name: true } } },
        });
    }

    // ─── Leave team ──────────────────────────────────────────────────────────
    async leave(userId: string, teamId: string) {
        const team = await this.findOne(teamId);
        if (team.createdById === userId) {
            throw new BadRequestException('Team leader cannot leave — delete the team instead');
        }
        await this.prisma.studyTeamMember.delete({
            where: { teamId_userId: { teamId, userId } },
        });
        return { message: 'Left team successfully' };
    }

    // ─── Kick member (leader/admin only) ─────────────────────────────────────
    async kickMember(requesterId: string, teamId: string, targetUserId: string, isAdmin: boolean) {
        const team = await this.findOne(teamId);
        if (!isAdmin && team.createdById !== requesterId) {
            throw new ForbiddenException('Only the team leader or admin can remove members');
        }
        if (targetUserId === team.createdById) {
            throw new BadRequestException('Cannot remove the team leader');
        }
        await this.prisma.studyTeamMember.delete({
            where: { teamId_userId: { teamId, userId: targetUserId } },
        });
        return { message: 'Member removed' };
    }

    // ─── My teams ────────────────────────────────────────────────────────────
    async getMyTeams(userId: string) {
        return this.prisma.studyTeam.findMany({
            where: { members: { some: { userId } } },
            include: {
                _count: { select: { members: true } },
                createdBy: { select: { id: true, name: true } },
            },
        });
    }
}
