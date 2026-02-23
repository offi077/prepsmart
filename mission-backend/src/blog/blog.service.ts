import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateBlogDto, UpdateBlogDto } from './dto/blog.dto.js';
import { BlogStatusEnum } from '../../generated/prisma/enums.js';

@Injectable()
export class BlogService {
    constructor(private readonly prisma: PrismaService) { }

    async create(authorId: string, dto: CreateBlogDto) {
        const existing = await this.prisma.blog.findUnique({ where: { slug: dto.slug } });
        if (existing) throw new ConflictException('Slug already in use');

        return this.prisma.blog.create({
            data: {
                ...dto,
                authorId,
                scheduledDate: dto.scheduledDate ? new Date(dto.scheduledDate) : null,
                publishedDate: dto.status === BlogStatusEnum.PUBLISHED ? new Date() : null,
                tags: dto.tags ?? [],
                sources: dto.sources ?? [],
            } as any,
        });
    }

    async findAll(query: {
        category?: string; tag?: string; status?: BlogStatusEnum;
        search?: string; page?: number; limit?: number;
    }) {
        const { category, tag, status, search, page = 1, limit = 20 } = query;
        const skip = (page - 1) * limit;
        const where: any = {};
        if (category) where.category = category;
        if (status) where.status = status;
        else where.status = BlogStatusEnum.PUBLISHED; // public: only published
        if (search) where.OR = [
            { title: { contains: search, mode: 'insensitive' } },
            { excerpt: { contains: search, mode: 'insensitive' } },
        ];
        if (tag) where.tags = { array_contains: tag };

        const [data, total] = await Promise.all([
            this.prisma.blog.findMany({
                where, skip, take: limit, orderBy: { publishedDate: 'desc' },
                include: { author: { select: { id: true, name: true, avatar: true } } },
            }),
            this.prisma.blog.count({ where }),
        ]);
        return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    }

    async findAllAdmin(query: { status?: BlogStatusEnum; page?: number; limit?: number }) {
        const { status, page = 1, limit = 20 } = query;
        const skip = (page - 1) * limit;
        const where: any = {};
        if (status) where.status = status;

        const [data, total] = await Promise.all([
            this.prisma.blog.findMany({
                where, skip, take: limit, orderBy: { createdAt: 'desc' },
                include: { author: { select: { id: true, name: true } } },
            }),
            this.prisma.blog.count({ where }),
        ]);
        return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    }

    async findBySlug(slug: string) {
        const blog = await this.prisma.blog.findUnique({
            where: { slug },
            include: { author: { select: { id: true, name: true, avatar: true } } },
        });
        if (!blog) throw new NotFoundException('Blog not found');
        // Increment views
        await this.prisma.blog.update({ where: { slug }, data: { views: { increment: 1 } } });
        return blog;
    }

    async findOne(id: string) {
        const blog = await this.prisma.blog.findUnique({
            where: { id },
            include: { author: { select: { id: true, name: true } } },
        });
        if (!blog) throw new NotFoundException('Blog not found');
        return blog;
    }

    async update(id: string, dto: UpdateBlogDto) {
        await this.findOne(id);
        const data: any = { ...dto };
        if (dto.status === BlogStatusEnum.PUBLISHED) data.publishedDate = new Date();
        if (dto.scheduledDate) data.scheduledDate = new Date(dto.scheduledDate);
        return this.prisma.blog.update({ where: { id }, data });
    }

    async remove(id: string) {
        await this.findOne(id);
        await this.prisma.blog.delete({ where: { id } });
        return { message: 'Blog deleted successfully' };
    }
}
