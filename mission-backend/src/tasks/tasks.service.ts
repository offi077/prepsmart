import {
    Injectable, NotFoundException, ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto.js';

@Injectable()
export class TasksService {
    constructor(private readonly prisma: PrismaService) { }

    // ─── Create task (employee/mentor/admin) ──────────────────────────────────
    async create(assignedById: string, dto: CreateTaskDto) {
        return this.prisma.task.create({
            data: {
                ...dto,
                assignedById,
                deadline: dto.deadline ? new Date(dto.deadline) : null,
            } as any,
            include: {
                assignedTo: { select: { id: true, name: true, avatar: true } },
                assignedBy: { select: { id: true, name: true } },
            },
        });
    }

    // ─── List tasks (admin sees all, employee/mentor sees assigned-by them) ───
    async findAll(userId: string, isAdmin: boolean, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const where = isAdmin ? {} : { assignedById: userId };
        const [data, total] = await Promise.all([
            this.prisma.task.findMany({
                where, skip, take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    assignedTo: { select: { id: true, name: true } },
                    assignedBy: { select: { id: true, name: true } },
                },
            }),
            this.prisma.task.count({ where }),
        ]);
        return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    }

    // ─── My assigned tasks (tasks assigned to me) ─────────────────────────────
    async getMyTasks(userId: string, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.prisma.task.findMany({
                where: { assignedToId: userId },
                skip, take: limit,
                orderBy: { deadline: 'asc' },
                include: { assignedBy: { select: { id: true, name: true } } },
            }),
            this.prisma.task.count({ where: { assignedToId: userId } }),
        ]);
        return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    }

    // ─── Get single task ──────────────────────────────────────────────────────
    async findOne(id: string) {
        const task = await this.prisma.task.findUnique({
            where: { id },
            include: {
                assignedTo: { select: { id: true, name: true, avatar: true } },
                assignedBy: { select: { id: true, name: true } },
            },
        });
        if (!task) throw new NotFoundException('Task not found');
        return task;
    }

    // ─── Update task ─────────────────────────────────────────────────────────
    async update(userId: string, id: string, dto: UpdateTaskDto, isAdmin: boolean) {
        const task = await this.findOne(id);

        // Assignees can only update status; creator/admin can update everything
        const isCreator = task.assignedById === userId;
        const isAssignee = task.assignedToId === userId;

        if (!isAdmin && !isCreator && !isAssignee) {
            throw new ForbiddenException('No permission to update this task');
        }

        // Assignee can only change status
        const data: any = isAssignee && !isAdmin && !isCreator
            ? { status: dto.status }
            : { ...dto, deadline: dto.deadline ? new Date(dto.deadline) : undefined };

        return this.prisma.task.update({ where: { id }, data });
    }

    // ─── Delete task (creator/admin) ──────────────────────────────────────────
    async remove(userId: string, id: string, isAdmin: boolean) {
        const task = await this.findOne(id);
        if (!isAdmin && task.assignedById !== userId) {
            throw new ForbiddenException('Only the task creator or admin can delete');
        }
        await this.prisma.task.delete({ where: { id } });
        return { message: 'Task deleted' };
    }
}
