import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import {
    CreateCurrentAffairDto, UpdateCurrentAffairDto,
    CreateDownloadDto, UpdateDownloadDto,
} from './dto/content.dto.js';

// ─── Current Affairs Service ──────────────────────────────────────────────────
@Injectable()
export class CurrentAffairsService {
    constructor(private readonly prisma: PrismaService) { }

    async create(dto: CreateCurrentAffairDto) {
        return this.prisma.currentAffair.create({
            data: { ...dto, date: new Date(dto.date), tags: dto.tags ?? [] },
        });
    }

    async findAll(query: { topic?: string; category?: string; search?: string; page?: number; limit?: number }) {
        const { topic, category, search, page = 1, limit = 20 } = query;
        const skip = (page - 1) * limit;
        const where: any = { isActive: true };
        if (topic) where.topic = { contains: topic, mode: 'insensitive' };
        if (category) where.category = category;
        if (search) where.OR = [
            { title: { contains: search, mode: 'insensitive' } },
            { content: { contains: search, mode: 'insensitive' } },
        ];

        const [data, total] = await Promise.all([
            this.prisma.currentAffair.findMany({ where, skip, take: limit, orderBy: { date: 'desc' } }),
            this.prisma.currentAffair.count({ where }),
        ]);
        return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    }

    async findOne(id: string) {
        const item = await this.prisma.currentAffair.findUnique({ where: { id } });
        if (!item) throw new NotFoundException('Current affair not found');
        return item;
    }

    async update(id: string, dto: UpdateCurrentAffairDto) {
        await this.findOne(id);
        return this.prisma.currentAffair.update({ where: { id }, data: dto as any });
    }

    async remove(id: string) {
        await this.findOne(id);
        await this.prisma.currentAffair.delete({ where: { id } });
        return { message: 'Deleted successfully' };
    }
}

// ─── Downloads Service ────────────────────────────────────────────────────────
@Injectable()
export class DownloadsService {
    constructor(private readonly prisma: PrismaService) { }

    async create(dto: CreateDownloadDto) {
        return this.prisma.download.create({ data: dto as any });
    }

    async findAll(query: { category?: string; fileType?: string; search?: string; page?: number; limit?: number }) {
        const { category, fileType, search, page = 1, limit = 20 } = query;
        const skip = (page - 1) * limit;
        const where: any = { isActive: true };
        if (category) where.category = category;
        if (fileType) where.fileType = fileType;
        if (search) where.title = { contains: search, mode: 'insensitive' };

        const [data, total] = await Promise.all([
            this.prisma.download.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
            this.prisma.download.count({ where }),
        ]);
        return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    }

    async findOne(id: string) {
        const item = await this.prisma.download.findUnique({ where: { id } });
        if (!item) throw new NotFoundException('Download not found');
        return item;
    }

    async trackDownload(id: string) {
        await this.findOne(id);
        return this.prisma.download.update({ where: { id }, data: { downloads: { increment: 1 } } });
    }

    async update(id: string, dto: UpdateDownloadDto) {
        await this.findOne(id);
        return this.prisma.download.update({ where: { id }, data: dto as any });
    }

    async remove(id: string) {
        await this.findOne(id);
        await this.prisma.download.delete({ where: { id } });
        return { message: 'Deleted successfully' };
    }
}
