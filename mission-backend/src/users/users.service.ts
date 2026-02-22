import {
    Injectable,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { UpdateUserDto, AdminUpdateUserDto } from './dto/update-user.dto.js';
import { QueryUsersDto } from './dto/query-users.dto.js';
import { UserRole } from '../../generated/prisma/enums.js';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) { }

    // ─── List users (admin, super-admin, owner, mentor) ───────────────────────────
    async findAll(query: QueryUsersDto) {
        const { role, status, examCategory, search, page = 1, limit = 20 } = query;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (role) where.role = role;
        if (status) where.status = status;
        if (examCategory) where.examCategory = examCategory;
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    status: true,
                    avatar: true,
                    targetExam: true,
                    examCategory: true,
                    state: true,
                    employeeCategory: true,
                    createdAt: true,
                },
            }),
            this.prisma.user.count({ where }),
        ]);

        return {
            data: users,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    // ─── Get single user by ID ─────────────────────────────────────────────────
    async findOne(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                status: true,
                avatar: true,
                targetExam: true,
                secondaryExam: true,
                examCategory: true,
                state: true,
                employeeCategory: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!user) throw new NotFoundException('User not found');
        return user;
    }

    // ─── Update own profile (student/employee/mentor can update limited fields) ─
    async updateProfile(userId: string, dto: UpdateUserDto) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');

        return this.prisma.user.update({
            where: { id: userId },
            data: dto,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                status: true,
                avatar: true,
                targetExam: true,
                secondaryExam: true,
                examCategory: true,
                state: true,
                employeeCategory: true,
                updatedAt: true,
            },
        });
    }

    // ─── Admin update user (can change role and status) ───────────────────────
    async adminUpdateUser(
        requesterId: string,
        requesterRole: UserRole,
        targetId: string,
        dto: AdminUpdateUserDto,
    ) {
        const target = await this.prisma.user.findUnique({ where: { id: targetId } });
        if (!target) throw new NotFoundException('User not found');

        // Only OWNER can change another OWNER or SUPER_ADMIN
        if (
            (target.role === UserRole.OWNER || target.role === UserRole.SUPER_ADMIN) &&
            requesterRole !== UserRole.OWNER
        ) {
            throw new ForbiddenException('Insufficient permissions to modify this user');
        }

        return this.prisma.user.update({
            where: { id: targetId },
            data: dto,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                status: true,
                avatar: true,
                examCategory: true,
                employeeCategory: true,
                updatedAt: true,
            },
        });
    }

    // ─── Delete user (admin/super-admin/owner only) ───────────────────────────
    async remove(requesterId: string, requesterRole: UserRole, targetId: string) {
        if (requesterId === targetId) {
            throw new ForbiddenException('You cannot delete your own account');
        }

        const target = await this.prisma.user.findUnique({ where: { id: targetId } });
        if (!target) throw new NotFoundException('User not found');

        if (
            (target.role === UserRole.OWNER || target.role === UserRole.SUPER_ADMIN) &&
            requesterRole !== UserRole.OWNER
        ) {
            throw new ForbiddenException('Insufficient permissions to delete this user');
        }

        await this.prisma.user.delete({ where: { id: targetId } });
        return { message: 'User deleted successfully' };
    }

    // ─── Get user stats summary (for admin dashboards) ────────────────────────
    async getStats() {
        const [total, byRole, byStatus] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.user.groupBy({
                by: ['role'],
                _count: { id: true },
            }),
            this.prisma.user.groupBy({
                by: ['status'],
                _count: { id: true },
            }),
        ]);

        return {
            total,
            byRole: Object.fromEntries(byRole.map((r) => [r.role, r._count.id])),
            byStatus: Object.fromEntries(byStatus.map((s) => [s.status, s._count.id])),
        };
    }
}
