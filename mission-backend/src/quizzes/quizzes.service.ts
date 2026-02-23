import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateQuizDto, UpdateQuizDto, SubmitQuizDto, QueryQuizzesDto } from './dto/quiz.dto.js';
import { QuestionTypeEnum } from '../../generated/prisma/enums.js';

@Injectable()
export class QuizzesService {
    constructor(private readonly prisma: PrismaService) { }

    // ─── CRUD ────────────────────────────────────────────────────────────────
    async create(dto: CreateQuizDto) {
        return this.prisma.quiz.create({
            data: {
                type: dto.type,
                title: dto.title,
                description: dto.description,
                subject: dto.subject,
                totalQuestions: dto.totalQuestions,
                duration: dto.duration,
                difficulty: dto.difficulty,
                examLevel: dto.examLevel,
                scheduledDate: dto.scheduledDate ? new Date(dto.scheduledDate) : null,
                isLocked: dto.isLocked ?? false,
                questions: dto.questions,
            },
        });
    }

    async findAll(query: QueryQuizzesDto) {
        const { type, subject, difficulty, page = 1, limit = 20 } = query;
        const skip = (page - 1) * limit;
        const where: any = { isActive: true };
        if (type) where.type = type;
        if (subject) where.subject = { contains: subject, mode: 'insensitive' };
        if (difficulty) where.difficulty = difficulty;

        const [data, total] = await Promise.all([
            this.prisma.quiz.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true, type: true, title: true, subject: true, totalQuestions: true,
                    duration: true, difficulty: true, examLevel: true, scheduledDate: true,
                    isLocked: true, createdAt: true, _count: { select: { attempts: true } },
                },
            }),
            this.prisma.quiz.count({ where }),
        ]);
        return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    }

    async findOne(id: string, includeQuestions = true) {
        const quiz = await this.prisma.quiz.findUnique({ where: { id } });
        if (!quiz) throw new NotFoundException('Quiz not found');
        if (!includeQuestions) {
            const { questions, ...rest } = quiz as any;
            return rest;
        }
        return quiz;
    }

    async update(id: string, dto: UpdateQuizDto) {
        await this.findOne(id, false);
        return this.prisma.quiz.update({ where: { id }, data: dto as any });
    }

    async remove(id: string) {
        await this.findOne(id, false);
        await this.prisma.quiz.delete({ where: { id } });
        return { message: 'Quiz deleted successfully' };
    }

    // ─── Student: Attempt a quiz ──────────────────────────────────────────────
    async submitAttempt(userId: string, quizId: string, dto: SubmitQuizDto) {
        const quiz = await this.findOne(quizId, true);
        if ((quiz as any).isLocked) throw new BadRequestException('This quiz is currently locked');

        const questions: any[] = (quiz as any).questions ?? [];
        let score = 0;

        for (const q of questions) {
            const userAnswer = dto.answers[q.id];
            if (!userAnswer) continue;
            const isCorrect = this.checkAnswer(q.type, q.correctAnswer, userAnswer);
            if (isCorrect) score += q.marks ?? 1;
        }

        return this.prisma.quizAttempt.create({
            data: {
                userId,
                quizId,
                answers: dto.answers,
                score,
                timeTaken: dto.timeTaken,
                completed: true,
            },
        });
    }

    async getMyAttempts(userId: string) {
        return this.prisma.quizAttempt.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: { quiz: { select: { id: true, title: true, type: true, subject: true } } },
        });
    }

    // ─── Leaderboard ──────────────────────────────────────────────────────────
    async getLeaderboard(quizId: string, limit = 10) {
        return this.prisma.quizAttempt.findMany({
            where: { quizId, completed: true },
            orderBy: { score: 'desc' },
            take: limit,
            include: { user: { select: { id: true, name: true, avatar: true } } },
        });
    }

    // ─── Today's daily quiz ───────────────────────────────────────────────────
    async getDailyQuiz() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        return this.prisma.quiz.findFirst({
            where: { type: 'DAILY', scheduledDate: { gte: today, lt: tomorrow }, isActive: true },
        });
    }

    private checkAnswer(type: string, correct: any, user: string | string[]): boolean {
        if (type === 'MCQ' || type === 'NUMERICAL') {
            return String(correct).trim() === String(user).trim();
        }
        if (type === 'MSQ') {
            const c = (Array.isArray(correct) ? correct : [correct]).map(String).sort();
            const u = (Array.isArray(user) ? user : [user]).map(String).sort();
            return JSON.stringify(c) === JSON.stringify(u);
        }
        return false;
    }
}
