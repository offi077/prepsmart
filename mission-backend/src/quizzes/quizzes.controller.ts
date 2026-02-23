import {
    Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, Request,
} from '@nestjs/common';
import { QuizzesService } from './quizzes.service.js';
import { CreateQuizDto, UpdateQuizDto, SubmitQuizDto, QueryQuizzesDto } from './dto/quiz.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../../generated/prisma/enums.js';

@UseGuards(JwtAuthGuard)
@Controller('quizzes')
export class QuizzesController {
    constructor(private readonly quizzesService: QuizzesService) { }

    // GET /api/quizzes/daily — today's daily quiz
    @Get('daily')
    getDailyQuiz() {
        return this.quizzesService.getDailyQuiz();
    }

    // GET /api/quizzes/my-attempts — student's quiz history
    @Get('my-attempts')
    getMyAttempts(@Request() req: any) {
        return this.quizzesService.getMyAttempts(req.user.sub);
    }

    // POST /api/quizzes — create quiz (admin/employee)
    @Post()
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.EMPLOYEE)
    create(@Body() dto: CreateQuizDto) {
        return this.quizzesService.create(dto);
    }

    // GET /api/quizzes — list quizzes (paginated, filterable)
    @Get()
    findAll(@Query() query: QueryQuizzesDto) {
        return this.quizzesService.findAll(query);
    }

    // GET /api/quizzes/:id — get quiz with questions
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.quizzesService.findOne(id, true);
    }

    // PATCH /api/quizzes/:id
    @Patch(':id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.EMPLOYEE)
    update(@Param('id') id: string, @Body() dto: UpdateQuizDto) {
        return this.quizzesService.update(id, dto);
    }

    // DELETE /api/quizzes/:id
    @Delete(':id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.OWNER)
    remove(@Param('id') id: string) {
        return this.quizzesService.remove(id);
    }

    // POST /api/quizzes/:id/attempt — submit quiz attempt
    @Post(':id/attempt')
    submitAttempt(@Request() req: any, @Param('id') quizId: string, @Body() dto: SubmitQuizDto) {
        return this.quizzesService.submitAttempt(req.user.sub, quizId, dto);
    }

    // GET /api/quizzes/:id/leaderboard
    @Get(':id/leaderboard')
    getLeaderboard(@Param('id') quizId: string, @Query('limit') limit?: string) {
        return this.quizzesService.getLeaderboard(quizId, limit ? parseInt(limit) : 10);
    }
}
