import {
    Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, Request,
} from '@nestjs/common';
import { TasksService } from './tasks.service.js';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../../generated/prisma/enums.js';

@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
    constructor(private readonly tasksService: TasksService) { }

    // GET /api/tasks/my — tasks assigned to me
    @Get('my')
    getMyTasks(
        @Request() req: any,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.tasksService.getMyTasks(
            req.user.sub,
            page ? parseInt(page) : 1,
            limit ? parseInt(limit) : 20,
        );
    }

    // POST /api/tasks — create task (employee/mentor/admin)
    @Post()
    @UseGuards(RolesGuard)
    @Roles(UserRole.EMPLOYEE, UserRole.MENTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.OWNER)
    create(@Request() req: any, @Body() dto: CreateTaskDto) {
        return this.tasksService.create(req.user.sub, dto);
    }

    // GET /api/tasks — list tasks (admin sees all, others see own created)
    @Get()
    @UseGuards(RolesGuard)
    @Roles(UserRole.EMPLOYEE, UserRole.MENTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.OWNER)
    findAll(
        @Request() req: any,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        const isAdmin = [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.OWNER].includes(req.user.role);
        return this.tasksService.findAll(
            req.user.sub,
            isAdmin,
            page ? parseInt(page) : 1,
            limit ? parseInt(limit) : 20,
        );
    }

    // GET /api/tasks/:id — get task detail
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.tasksService.findOne(id);
    }

    // PATCH /api/tasks/:id — update task
    @Patch(':id')
    update(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateTaskDto) {
        const isAdmin = [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.OWNER].includes(req.user.role);
        return this.tasksService.update(req.user.sub, id, dto, isAdmin);
    }

    // DELETE /api/tasks/:id — delete task (creator/admin)
    @Delete(':id')
    remove(@Request() req: any, @Param('id') id: string) {
        const isAdmin = [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.OWNER].includes(req.user.role);
        return this.tasksService.remove(req.user.sub, id, isAdmin);
    }
}
