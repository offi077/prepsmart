import {
    Controller,
    Get,
    Patch,
    Delete,
    Param,
    Body,
    Query,
    UseGuards,
    Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service.js';
import { UpdateUserDto, AdminUpdateUserDto } from './dto/update-user.dto.js';
import { QueryUsersDto } from './dto/query-users.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../../generated/prisma/enums.js';

@ApiTags('Users')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    // GET /api/users — list all users (admin+)
    @ApiOperation({ summary: 'List all users (admin+, paginated, filterable)' })
    @Get()
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.MENTOR)
    findAll(@Query() query: QueryUsersDto) {
        return this.usersService.findAll(query);
    }

    // GET /api/users/stats — user count stats (admin+)
    @ApiOperation({ summary: 'User count stats by role and status' })
    @Get('stats')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.OWNER)
    getStats() {
        return this.usersService.getStats();
    }

    // GET /api/users/me — current user's own profile
    @ApiOperation({ summary: "Get my own profile" })
    @Get('me')
    getMe(@Request() req: any) {
        return this.usersService.findOne(req.user.sub);
    }

    // PATCH /api/users/me — update own profile
    @ApiOperation({ summary: 'Update my own profile' })
    @Patch('me')
    updateMe(@Request() req: any, @Body() dto: UpdateUserDto) {
        return this.usersService.updateProfile(req.user.sub, dto);
    }

    // GET /api/users/:id — get user by ID (admin+)
    @ApiOperation({ summary: 'Get user by ID (admin+)' })
    @Get(':id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.MENTOR)
    findOne(@Param('id') id: string) {
        return this.usersService.findOne(id);
    }

    // PATCH /api/users/:id — admin update (role, status, etc.)
    @ApiOperation({ summary: 'Admin: update user role/status' })
    @Patch(':id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.OWNER)
    adminUpdate(
        @Request() req: any,
        @Param('id') id: string,
        @Body() dto: AdminUpdateUserDto,
    ) {
        return this.usersService.adminUpdateUser(
            req.user.sub,
            req.user.role,
            id,
            dto,
        );
    }

    // DELETE /api/users/:id — delete user (admin+)
    @ApiOperation({ summary: 'Delete user (admin+)' })
    @Delete(':id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.OWNER)
    remove(@Request() req: any, @Param('id') id: string) {
        return this.usersService.remove(req.user.sub, req.user.role, id);
    }
}
