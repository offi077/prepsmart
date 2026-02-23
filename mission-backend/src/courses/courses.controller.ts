import {
    Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, Request,
} from '@nestjs/common';
import { CoursesService } from './courses.service.js';
import { CreateCourseDto, UpdateCourseDto } from './dto/course.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../../generated/prisma/enums.js';

@UseGuards(JwtAuthGuard)
@Controller('courses')
export class CoursesController {
    constructor(private readonly coursesService: CoursesService) { }

    // GET /api/courses/my-enrollments
    @Get('my-enrollments')
    getMyEnrollments(@Request() req: any) {
        return this.coursesService.getMyEnrollments(req.user.sub);
    }

    // POST /api/courses
    @Post()
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.OWNER)
    create(@Body() dto: CreateCourseDto) {
        return this.coursesService.create(dto);
    }

    // GET /api/courses
    @Get()
    findAll(
        @Query('categoryId') categoryId?: string,
        @Query('isPaid') isPaid?: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.coursesService.findAll({
            categoryId,
            isPaid: isPaid !== undefined ? isPaid === 'true' : undefined,
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 20,
        });
    }

    // GET /api/courses/:id
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.coursesService.findOne(id);
    }

    // PATCH /api/courses/:id
    @Patch(':id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.OWNER)
    update(@Param('id') id: string, @Body() dto: UpdateCourseDto) {
        return this.coursesService.update(id, dto);
    }

    // DELETE /api/courses/:id
    @Delete(':id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.OWNER)
    remove(@Param('id') id: string) {
        return this.coursesService.remove(id);
    }

    // POST /api/courses/:id/enroll
    @Post(':id/enroll')
    enroll(@Request() req: any, @Param('id') courseId: string) {
        return this.coursesService.enroll(req.user.sub, courseId);
    }

    // PATCH /api/courses/:id/progress
    @Patch(':id/progress')
    updateProgress(
        @Request() req: any,
        @Param('id') courseId: string,
        @Body('progress') progress: number,
    ) {
        return this.coursesService.updateProgress(req.user.sub, courseId, progress);
    }
}
