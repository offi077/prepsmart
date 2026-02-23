import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateNotificationDto, BroadcastNotificationDto } from './dto/notification.dto.js';
import { NotificationTypeEnum } from '../../generated/prisma/enums.js';

@Injectable()
export class NotificationsService {
    constructor(private readonly prisma: PrismaService) { }

    // ─── Create single notification ──────────────────────────────────────────
    async create(dto: CreateNotificationDto) {
        return this.prisma.notification.create({
            data: {
                userId: dto.userId,
                title: dto.title,
                message: dto.message,
                type: dto.type,
            },
        });
    }

    // ─── Broadcast to all users (optionally filtered by role) ────────────────
    async broadcast(dto: BroadcastNotificationDto) {
        const users = await this.prisma.user.findMany({
            where: dto.role ? { role: dto.role as any } : {},
            select: { id: true },
        });

        const notifications = users.map((u) => ({
            userId: u.id,
            title: dto.title,
            message: dto.message,
            type: dto.type,
        }));

        const result = await this.prisma.notification.createMany({ data: notifications });
        return { sent: result.count };
    }

    // ─── Get my notifications ────────────────────────────────────────────────
    async getMyNotifications(userId: string, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [data, total, unreadCount] = await Promise.all([
            this.prisma.notification.findMany({
                where: { userId },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.notification.count({ where: { userId } }),
            this.prisma.notification.count({ where: { userId, isRead: false } }),
        ]);

        return {
            data,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit), unreadCount },
        };
    }

    // ─── Mark one notification as read ───────────────────────────────────────
    async markRead(userId: string, notificationId: string) {
        const n = await this.prisma.notification.findUnique({ where: { id: notificationId } });
        if (!n) throw new NotFoundException('Notification not found');
        if (n.userId !== userId) throw new NotFoundException('Notification not found');

        return this.prisma.notification.update({
            where: { id: notificationId },
            data: { isRead: true },
        });
    }

    // ─── Mark all as read ─────────────────────────────────────────────────────
    async markAllRead(userId: string) {
        const result = await this.prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });
        return { updated: result.count };
    }

    // ─── Delete a notification ────────────────────────────────────────────────
    async remove(userId: string, notificationId: string) {
        const n = await this.prisma.notification.findUnique({ where: { id: notificationId } });
        if (!n || n.userId !== userId) throw new NotFoundException('Notification not found');
        await this.prisma.notification.delete({ where: { id: notificationId } });
        return { message: 'Notification deleted' };
    }

    // ─── Unread count helper ──────────────────────────────────────────────────
    async getUnreadCount(userId: string) {
        const count = await this.prisma.notification.count({ where: { userId, isRead: false } });
        return { unreadCount: count };
    }
}
