import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateCourseDto, UpdateCourseDto } from './dto/course.dto.js';

@Injectable()
export class CoursesService {
    constructor(private readonly prisma: PrismaService) { }

    async create(dto: CreateCourseDto) {
        return this.prisma.course.create({ data: dto as any });
    }

    async findAll(query: { categoryId?: string; isPaid?: boolean; page?: number; limit?: number }) {
        const { categoryId, isPaid, page = 1, limit = 20 } = query;
        const skip = (page - 1) * limit;
        const where: any = { isActive: true };
        if (categoryId) where.categoryId = categoryId;
        if (isPaid !== undefined) where.isPaid = isPaid;

        const [data, total] = await Promise.all([
            this.prisma.course.findMany({
                where, skip, take: limit, orderBy: { createdAt: 'desc' },
                include: {
                    category: { select: { name: true, slug: true } },
                    _count: { select: { enrollments: true } },
                },
            }),
            this.prisma.course.count({ where }),
        ]);
        return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    }

    async findOne(id: string) {
        const course = await this.prisma.course.findUnique({
            where: { id },
            include: { category: { select: { name: true, slug: true } }, _count: { select: { enrollments: true } } },
        });
        if (!course) throw new NotFoundException('Course not found');
        return course;
    }

    async update(id: string, dto: UpdateCourseDto) {
        await this.findOne(id);
        return this.prisma.course.update({ where: { id }, data: dto as any });
    }

    async remove(id: string) {
        await this.findOne(id);
        await this.prisma.course.delete({ where: { id } });
        return { message: 'Course deleted successfully' };
    }

    // ─── Enrollment ───────────────────────────────────────────────────────────
    async enroll(userId: string, courseId: string) {
        await this.findOne(courseId);
        const existing = await this.prisma.courseEnrollment.findUnique({
            where: { userId_courseId: { userId, courseId } },
        });
        if (existing) throw new ConflictException('Already enrolled in this course');
        return this.prisma.courseEnrollment.create({ data: { userId, courseId } });
    }

    async getMyEnrollments(userId: string) {
        return this.prisma.courseEnrollment.findMany({
            where: { userId },
            include: { course: { select: { id: true, title: true, description: true, thumbnail: true, isPaid: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }

    async updateProgress(userId: string, courseId: string, progress: number) {
        const enrollment = await this.prisma.courseEnrollment.findUnique({
            where: { userId_courseId: { userId, courseId } },
        });
        if (!enrollment) throw new NotFoundException('Enrollment not found');
        return this.prisma.courseEnrollment.update({
            where: { userId_courseId: { userId, courseId } },
            data: { progress, completedAt: progress >= 100 ? new Date() : null },
        });
    }
}
