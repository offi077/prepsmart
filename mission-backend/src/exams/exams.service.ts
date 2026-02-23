import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateExamDto, UpdateExamDto, CreateSectionDto, UpdateSectionDto } from './dto/exam.dto.js';
import { CreateQuestionDto, UpdateQuestionDto, SubmitExamDto } from './dto/question.dto.js';
import { QuestionTypeEnum } from '../../generated/prisma/enums.js';

@Injectable()
export class ExamsService {
    constructor(private readonly prisma: PrismaService) { }

    // ═══════════════════════════════════════════════════════════
    // EXAMS
    // ═══════════════════════════════════════════════════════════

    async createExam(dto: CreateExamDto) {
        return this.prisma.exam.create({
            data: {
                title: dto.title,
                description: dto.description,
                categoryId: dto.categoryId,
                examLevel: dto.examLevel,
                totalDuration: dto.totalDuration,
                totalQuestions: dto.totalQuestions,
                instructions: dto.instructions,
                languages: dto.languages,
            },
            include: { sections: true, category: { select: { name: true, slug: true } } },
        });
    }

    async findAllExams(query: {
        categoryId?: string;
        examLevel?: string;
        isActive?: boolean;
        page?: number;
        limit?: number;
    }) {
        const { categoryId, examLevel, isActive, page = 1, limit = 20 } = query;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (categoryId) where.categoryId = categoryId;
        if (examLevel) where.examLevel = examLevel;
        if (isActive !== undefined) where.isActive = isActive;

        const [exams, total] = await Promise.all([
            this.prisma.exam.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    category: { select: { name: true, slug: true } },
                    _count: { select: { sections: true, sessions: true } },
                },
            }),
            this.prisma.exam.count({ where }),
        ]);

        return { data: exams, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    }

    async findOneExam(id: string, withQuestions = false) {
        const exam = await this.prisma.exam.findUnique({
            where: { id },
            include: {
                category: { select: { name: true, slug: true } },
                sections: withQuestions
                    ? { include: { questions: true } }
                    : { select: { id: true, name: true, questionsCount: true, duration: true } },
            },
        });
        if (!exam) throw new NotFoundException('Exam not found');
        return exam;
    }

    async updateExam(id: string, dto: UpdateExamDto) {
        await this.findOneExam(id);
        return this.prisma.exam.update({
            where: { id },
            data: dto,
            include: { category: { select: { name: true } } },
        });
    }

    async deleteExam(id: string) {
        await this.findOneExam(id);
        await this.prisma.exam.delete({ where: { id } });
        return { message: 'Exam deleted successfully' };
    }

    // ═══════════════════════════════════════════════════════════
    // EXAM SECTIONS
    // ═══════════════════════════════════════════════════════════

    async createSection(examId: string, dto: CreateSectionDto) {
        await this.findOneExam(examId);
        return this.prisma.examSection.create({
            data: { examId, name: dto.name, questionsCount: dto.questionsCount, duration: dto.duration },
        });
    }

    async updateSection(sectionId: string, dto: UpdateSectionDto) {
        const section = await this.prisma.examSection.findUnique({ where: { id: sectionId } });
        if (!section) throw new NotFoundException('Section not found');
        return this.prisma.examSection.update({ where: { id: sectionId }, data: dto });
    }

    async deleteSection(sectionId: string) {
        const section = await this.prisma.examSection.findUnique({ where: { id: sectionId } });
        if (!section) throw new NotFoundException('Section not found');
        await this.prisma.examSection.delete({ where: { id: sectionId } });
        return { message: 'Section deleted successfully' };
    }

    // ═══════════════════════════════════════════════════════════
    // QUESTIONS
    // ═══════════════════════════════════════════════════════════

    async createQuestion(dto: CreateQuestionDto) {
        const section = await this.prisma.examSection.findUnique({ where: { id: dto.sectionId } });
        if (!section) throw new NotFoundException('Section not found');

        return this.prisma.question.create({
            data: {
                sectionId: dto.sectionId,
                type: dto.type,
                questionText: dto.questionText,
                options: dto.options ?? [],
                correctAnswer: dto.correctAnswer,
                marks: dto.marks ?? 1,
                negativeMarks: dto.negativeMarks ?? 0,
                explanation: dto.explanation,
                imageUrl: dto.imageUrl,
            },
        });
    }

    async getQuestionsBySection(sectionId: string) {
        const section = await this.prisma.examSection.findUnique({ where: { id: sectionId } });
        if (!section) throw new NotFoundException('Section not found');
        return this.prisma.question.findMany({
            where: { sectionId },
            orderBy: { createdAt: 'asc' },
        });
    }

    async updateQuestion(questionId: string, dto: UpdateQuestionDto) {
        const q = await this.prisma.question.findUnique({ where: { id: questionId } });
        if (!q) throw new NotFoundException('Question not found');
        return this.prisma.question.update({ where: { id: questionId }, data: dto as any });
    }

    async deleteQuestion(questionId: string) {
        const q = await this.prisma.question.findUnique({ where: { id: questionId } });
        if (!q) throw new NotFoundException('Question not found');
        await this.prisma.question.delete({ where: { id: questionId } });
        return { message: 'Question deleted successfully' };
    }

    // ═══════════════════════════════════════════════════════════
    // EXAM SESSIONS — Start / Submit / Results
    // ═══════════════════════════════════════════════════════════

    async startExam(userId: string, examId: string) {
        const exam = await this.findOneExam(examId);
        if (!exam.isActive) throw new ForbiddenException('This exam is not currently active');

        // Check if user has an active (unsubmitted) session
        const existing = await this.prisma.examSession.findFirst({
            where: { userId, examId, isSubmitted: false },
        });
        if (existing) return existing; // resume existing session

        return this.prisma.examSession.create({
            data: { userId, examId },
        });
    }

    async submitExam(userId: string, sessionId: string, dto: SubmitExamDto) {
        const session = await this.prisma.examSession.findUnique({ where: { id: sessionId } });
        if (!session) throw new NotFoundException('Exam session not found');
        if (session.userId !== userId) throw new ForbiddenException('Not your exam session');
        if (session.isSubmitted) throw new BadRequestException('Exam already submitted');

        // Load all questions for this exam to calculate score
        const sections = await this.prisma.examSection.findMany({
            where: { examId: session.examId },
            include: { questions: true },
        });

        let totalScore = 0;
        let totalMarks = 0;
        const sectionScores: Record<string, { attempted: number; correct: number; score: number }> = {};

        for (const section of sections) {
            let sectionScore = 0;
            let attempted = 0;
            let correct = 0;

            for (const q of section.questions) {
                totalMarks += q.marks;
                const answer = dto.answers[q.id];
                if (answer === undefined || answer === null || answer === '') continue;
                attempted++;

                const isCorrect = this.checkAnswer(q.type, q.correctAnswer, answer);
                if (isCorrect) {
                    sectionScore += q.marks;
                    totalScore += q.marks;
                    correct++;
                } else {
                    sectionScore -= q.negativeMarks;
                    totalScore -= q.negativeMarks;
                }
            }

            sectionScores[section.id] = { attempted, correct, score: sectionScore };
        }

        const percentage = totalMarks > 0 ? parseFloat(((totalScore / totalMarks) * 100).toFixed(2)) : 0;

        return this.prisma.examSession.update({
            where: { id: sessionId },
            data: {
                answers: dto.answers,
                score: totalScore,
                totalMarks,
                percentage,
                sectionScores,
                isSubmitted: true,
                endTime: new Date(),
                timeTaken: dto.timeTaken,
            },
        });
    }

    async getSessionResult(userId: string, sessionId: string) {
        const session = await this.prisma.examSession.findUnique({
            where: { id: sessionId },
            include: {
                exam: { select: { title: true, totalQuestions: true } },
            },
        });
        if (!session) throw new NotFoundException('Session not found');
        if (session.userId !== userId) throw new ForbiddenException('Not your session');
        return session;
    }

    async getUserSessions(userId: string) {
        return this.prisma.examSession.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: { exam: { select: { id: true, title: true, examLevel: true } } },
        });
    }

    // Admin: list all sessions for an exam
    async getExamSessions(examId: string, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [sessions, total] = await Promise.all([
            this.prisma.examSession.findMany({
                where: { examId, isSubmitted: true },
                skip,
                take: limit,
                orderBy: { score: 'desc' },
                include: { user: { select: { id: true, name: true, email: true } } },
            }),
            this.prisma.examSession.count({ where: { examId, isSubmitted: true } }),
        ]);
        return { data: sessions, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    }

    // ─── Score calculation helper ─────────────────────────────────────────────
    private checkAnswer(
        type: QuestionTypeEnum,
        correctAnswer: any,
        userAnswer: string | string[],
    ): boolean {
        if (type === QuestionTypeEnum.MCQ || type === QuestionTypeEnum.NUMERICAL) {
            return String(correctAnswer).trim() === String(userAnswer).trim();
        }
        if (type === QuestionTypeEnum.MSQ) {
            const correct = (Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer]).map(String).sort();
            const user = (Array.isArray(userAnswer) ? userAnswer : [userAnswer]).map(String).sort();
            return JSON.stringify(correct) === JSON.stringify(user);
        }
        return false;
    }
}
