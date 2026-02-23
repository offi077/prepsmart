import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Body,
    Query,
    UseGuards,
    Request,
    ParseBoolPipe,
    ParseIntPipe,
    Optional,
} from '@nestjs/common';
import { ExamsService } from './exams.service.js';
import { CreateExamDto, UpdateExamDto, CreateSectionDto, UpdateSectionDto } from './dto/exam.dto.js';
import { CreateQuestionDto, UpdateQuestionDto, SubmitExamDto } from './dto/question.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../../generated/prisma/enums.js';

@UseGuards(JwtAuthGuard)
@Controller('exams')
export class ExamsController {
    constructor(private readonly examsService: ExamsService) { }

    // ═══════════════════════════════════════════════════════════
    // EXAMS  
    // ═══════════════════════════════════════════════════════════

    // POST /api/exams — Create exam (admin, employee)
    @Post()
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.EMPLOYEE)
    createExam(@Body() dto: CreateExamDto) {
        return this.examsService.createExam(dto);
    }

    // GET /api/exams — List exams (all authenticated users)
    @Get()
    findAllExams(
        @Query('categoryId') categoryId?: string,
        @Query('examLevel') examLevel?: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.examsService.findAllExams({
            categoryId,
            examLevel,
            isActive: true,
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 20,
        });
    }

    // GET /api/exams/all — Admin sees all exams incl. inactive
    @Get('all')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.EMPLOYEE)
    findAllExamsAdmin(@Query('page') page?: string, @Query('limit') limit?: string) {
        return this.examsService.findAllExams({
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 20,
        });
    }

    // GET /api/exams/:id — Get exam detail (no questions)
    @Get(':id')
    findOneExam(@Param('id') id: string) {
        return this.examsService.findOneExam(id, false);
    }

    // GET /api/exams/:id/full — Get exam with questions (admin/employee)
    @Get(':id/full')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.EMPLOYEE)
    findOneExamFull(@Param('id') id: string) {
        return this.examsService.findOneExam(id, true);
    }

    // PATCH /api/exams/:id — Update exam
    @Patch(':id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.EMPLOYEE)
    updateExam(@Param('id') id: string, @Body() dto: UpdateExamDto) {
        return this.examsService.updateExam(id, dto);
    }

    // DELETE /api/exams/:id — Delete exam (admin only)
    @Delete(':id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.OWNER)
    deleteExam(@Param('id') id: string) {
        return this.examsService.deleteExam(id);
    }

    // ═══════════════════════════════════════════════════════════
    // SECTIONS
    // ═══════════════════════════════════════════════════════════

    // POST /api/exams/:id/sections
    @Post(':id/sections')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.EMPLOYEE)
    createSection(@Param('id') examId: string, @Body() dto: CreateSectionDto) {
        return this.examsService.createSection(examId, dto);
    }

    // PATCH /api/exams/sections/:sectionId
    @Patch('sections/:sectionId')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.EMPLOYEE)
    updateSection(@Param('sectionId') sectionId: string, @Body() dto: UpdateSectionDto) {
        return this.examsService.updateSection(sectionId, dto);
    }

    // DELETE /api/exams/sections/:sectionId
    @Delete('sections/:sectionId')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.OWNER)
    deleteSection(@Param('sectionId') sectionId: string) {
        return this.examsService.deleteSection(sectionId);
    }

    // ═══════════════════════════════════════════════════════════
    // QUESTIONS
    // ═══════════════════════════════════════════════════════════

    // POST /api/exams/questions — Add a question
    @Post('questions')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.EMPLOYEE)
    createQuestion(@Body() dto: CreateQuestionDto) {
        return this.examsService.createQuestion(dto);
    }

    // GET /api/exams/sections/:sectionId/questions
    @Get('sections/:sectionId/questions')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.EMPLOYEE)
    getQuestions(@Param('sectionId') sectionId: string) {
        return this.examsService.getQuestionsBySection(sectionId);
    }

    // PATCH /api/exams/questions/:questionId
    @Patch('questions/:questionId')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.EMPLOYEE)
    updateQuestion(@Param('questionId') questionId: string, @Body() dto: UpdateQuestionDto) {
        return this.examsService.updateQuestion(questionId, dto);
    }

    // DELETE /api/exams/questions/:questionId
    @Delete('questions/:questionId')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.OWNER)
    deleteQuestion(@Param('questionId') questionId: string) {
        return this.examsService.deleteQuestion(questionId);
    }

    // ═══════════════════════════════════════════════════════════
    // EXAM SESSIONS (Student)
    // ═══════════════════════════════════════════════════════════

    // POST /api/exams/:id/start — Start an exam
    @Post(':id/start')
    startExam(@Request() req: any, @Param('id') examId: string) {
        return this.examsService.startExam(req.user.sub, examId);
    }

    // POST /api/exams/sessions/:sessionId/submit — Submit answers
    @Post('sessions/:sessionId/submit')
    submitExam(
        @Request() req: any,
        @Param('sessionId') sessionId: string,
        @Body() dto: SubmitExamDto,
    ) {
        return this.examsService.submitExam(req.user.sub, sessionId, dto);
    }

    // GET /api/exams/sessions/:sessionId/result — View result
    @Get('sessions/:sessionId/result')
    getResult(@Request() req: any, @Param('sessionId') sessionId: string) {
        return this.examsService.getSessionResult(req.user.sub, sessionId);
    }

    // GET /api/exams/sessions/my — Get my exam history
    @Get('sessions/my')
    getMySessions(@Request() req: any) {
        return this.examsService.getUserSessions(req.user.sub);
    }

    // GET /api/exams/:id/sessions — Admin: all sessions for an exam
    @Get(':id/sessions')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.OWNER)
    getExamSessions(
        @Param('id') examId: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.examsService.getExamSessions(
            examId,
            page ? parseInt(page) : 1,
            limit ? parseInt(limit) : 20,
        );
    }
}
