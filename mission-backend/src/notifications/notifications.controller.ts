import {
    Controller, Get, Post, Delete, Param, Body, Query, UseGuards, Request,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service.js';
import { CreateNotificationDto, BroadcastNotificationDto } from './dto/notification.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../../generated/prisma/enums.js';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    // GET /api/notifications — my notifications
    @Get()
    getMyNotifications(
        @Request() req: any,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.notificationsService.getMyNotifications(
            req.user.sub,
            page ? parseInt(page) : 1,
            limit ? parseInt(limit) : 20,
        );
    }

    // GET /api/notifications/unread-count
    @Get('unread-count')
    getUnreadCount(@Request() req: any) {
        return this.notificationsService.getUnreadCount(req.user.sub);
    }

    // POST /api/notifications/read-all — mark all as read
    @Post('read-all')
    markAllRead(@Request() req: any) {
        return this.notificationsService.markAllRead(req.user.sub);
    }

    // POST /api/notifications/:id/read — mark one as read
    @Post(':id/read')
    markRead(@Request() req: any, @Param('id') id: string) {
        return this.notificationsService.markRead(req.user.sub, id);
    }

    // DELETE /api/notifications/:id
    @Delete(':id')
    remove(@Request() req: any, @Param('id') id: string) {
        return this.notificationsService.remove(req.user.sub, id);
    }

    // POST /api/notifications — create (admin only)
    @Post()
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.OWNER)
    create(@Body() dto: CreateNotificationDto) {
        return this.notificationsService.create(dto);
    }

    // POST /api/notifications/broadcast — broadcast to role (admin only)
    @Post('broadcast')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.OWNER)
    broadcast(@Body() dto: BroadcastNotificationDto) {
        return this.notificationsService.broadcast(dto);
    }
}
