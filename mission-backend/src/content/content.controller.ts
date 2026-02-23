import {
    Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, ParseIntPipe,
} from '@nestjs/common';
import { CurrentAffairsService, DownloadsService } from './content.service.js';
import {
    CreateCurrentAffairDto, UpdateCurrentAffairDto,
    CreateDownloadDto, UpdateDownloadDto,
} from './dto/content.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../../generated/prisma/enums.js';

// ─── Current Affairs Controller ───────────────────────────────────────────────
@Controller('current-affairs')
export class CurrentAffairsController {
    constructor(private readonly currentAffairsService: CurrentAffairsService) { }

    @Get()
    findAll(
        @Query('topic') topic?: string,
        @Query('category') category?: string,
        @Query('search') search?: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.currentAffairsService.findAll({
            topic, category, search,
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 20,
        });
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.currentAffairsService.findOne(id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.EMPLOYEE)
    @Post()
    create(@Body() dto: CreateCurrentAffairDto) {
        return this.currentAffairsService.create(dto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.EMPLOYEE)
    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateCurrentAffairDto) {
        return this.currentAffairsService.update(id, dto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.OWNER)
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.currentAffairsService.remove(id);
    }
}

// ─── Downloads Controller ─────────────────────────────────────────────────────
@Controller('downloads')
export class DownloadsController {
    constructor(private readonly downloadsService: DownloadsService) { }

    @Get()
    findAll(
        @Query('category') category?: string,
        @Query('fileType') fileType?: string,
        @Query('search') search?: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.downloadsService.findAll({
            category, fileType, search,
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 20,
        });
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.downloadsService.findOne(id);
    }

    // Increment download count
    @Post(':id/download')
    trackDownload(@Param('id') id: string) {
        return this.downloadsService.trackDownload(id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.EMPLOYEE)
    @Post()
    create(@Body() dto: CreateDownloadDto) {
        return this.downloadsService.create(dto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.EMPLOYEE)
    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateDownloadDto) {
        return this.downloadsService.update(id, dto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.OWNER)
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.downloadsService.remove(id);
    }
}
