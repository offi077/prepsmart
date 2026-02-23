import {
    Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, Request,
} from '@nestjs/common';
import { BlogService } from './blog.service.js';
import { CreateBlogDto, UpdateBlogDto } from './dto/blog.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole, BlogStatusEnum } from '../../generated/prisma/enums.js';

@Controller('blog')
export class BlogController {
    constructor(private readonly blogService: BlogService) { }

    // Public endpoints (no auth)
    @Get()
    findAll(
        @Query('category') category?: string,
        @Query('tag') tag?: string,
        @Query('search') search?: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.blogService.findAll({
            category, tag, search,
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 20,
        });
    }

    @Get('slug/:slug')
    findBySlug(@Param('slug') slug: string) {
        return this.blogService.findBySlug(slug);
    }

    // Auth-required endpoints below
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.EMPLOYEE)
    @Get('admin/all')
    findAllAdmin(
        @Query('status') status?: BlogStatusEnum,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.blogService.findAllAdmin({ status, page: page ? parseInt(page) : 1, limit: limit ? parseInt(limit) : 20 });
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.EMPLOYEE)
    @Post()
    create(@Request() req: any, @Body() dto: CreateBlogDto) {
        return this.blogService.create(req.user.sub, dto);
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.blogService.findOne(id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.EMPLOYEE)
    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateBlogDto) {
        return this.blogService.update(id, dto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.OWNER)
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.blogService.remove(id);
    }
}
