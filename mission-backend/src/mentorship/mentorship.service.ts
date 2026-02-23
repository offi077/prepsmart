import {
    Injectable, NotFoundException, ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateMentorshipSessionDto, UpdateMentorshipSessionDto } from './dto/mentorship.dto.js';

@Injectable()
export class MentorshipService {
    constructor(private readonly prisma: PrismaService) { }

    // ─── Schedule session (mentor only) ──────────────────────────────────────
    async create(mentorId: string, dto: CreateMentorshipSessionDto) {
        return this.prisma.mentorshipSession.create({
            data: {
                mentorId,
                studentId: dto.studentId,
                scheduledAt: new Date(dto.scheduledAt),
                duration: dto.duration,
                notes: dto.notes,
            },
            include: {
                mentor: { select: { id: true, name: true, avatar: true } },
                student: { select: { id: true, name: true, avatar: true } },
            },
        });
    }

    // ─── Mentor: view my sessions ─────────────────────────────────────────────
    async getMentorSessions(mentorId: string, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.prisma.mentorshipSession.findMany({
                where: { mentorId },
                skip, take: limit,
                orderBy: { scheduledAt: 'asc' },
                include: { student: { select: { id: true, name: true, avatar: true } } },
            }),
            this.prisma.mentorshipSession.count({ where: { mentorId } }),
        ]);
        return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    }

    // ─── Student: view my sessions ────────────────────────────────────────────
    async getStudentSessions(studentId: string, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.prisma.mentorshipSession.findMany({
                where: { studentId },
                skip, take: limit,
                orderBy: { scheduledAt: 'asc' },
                include: { mentor: { select: { id: true, name: true, avatar: true } } },
            }),
            this.prisma.mentorshipSession.count({ where: { studentId } }),
        ]);
        return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    }

    // ─── Get single session ───────────────────────────────────────────────────
    async findOne(id: string) {
        const session = await this.prisma.mentorshipSession.findUnique({
            where: { id },
            include: {
                mentor: { select: { id: true, name: true, avatar: true } },
                student: { select: { id: true, name: true, avatar: true } },
            },
        });
        if (!session) throw new NotFoundException('Session not found');
        return session;
    }

    // ─── Update session (mentor/admin only) ───────────────────────────────────
    async update(userId: string, id: string, dto: UpdateMentorshipSessionDto, isAdmin: boolean) {
        const session = await this.findOne(id);
        if (!isAdmin && session.mentorId !== userId) {
            throw new ForbiddenException('Only the mentor can update this session');
        }
        const data: any = { ...dto };
        if (dto.scheduledAt) data.scheduledAt = new Date(dto.scheduledAt);
        return this.prisma.mentorshipSession.update({ where: { id }, data });
    }

    // ─── Cancel / delete session ──────────────────────────────────────────────
    async remove(userId: string, id: string, isAdmin: boolean) {
        const session = await this.findOne(id);
        if (!isAdmin && session.mentorId !== userId) {
            throw new ForbiddenException('Only the mentor can cancel this session');
        }
        await this.prisma.mentorshipSession.delete({ where: { id } });
        return { message: 'Session cancelled' };
    }

    // ─── Admin: all sessions (paginated) ─────────────────────────────────────
    async getAllSessions(page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.prisma.mentorshipSession.findMany({
                skip, take: limit,
                orderBy: { scheduledAt: 'desc' },
                include: {
                    mentor: { select: { id: true, name: true } },
                    student: { select: { id: true, name: true } },
                },
            }),
            this.prisma.mentorshipSession.count(),
        ]);
        return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    }
}
