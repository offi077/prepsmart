import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class AnalyticsService {
    constructor(private readonly prisma: PrismaService) { }

    // ─── Student Performance Analytics ─────────────────────────────────────────
    async getStudentPerformance(userId: string) {
        const [examSessions, quizAttempts, enrollments] = await Promise.all([
            this.prisma.examSession.findMany({
                where: { userId, isSubmitted: true },
                orderBy: { createdAt: 'desc' },
                take: 10,
                include: { exam: { select: { title: true, examLevel: true } } },
            }),
            this.prisma.quizAttempt.findMany({
                where: { userId, completed: true },
                orderBy: { createdAt: 'desc' },
                take: 10,
                include: { quiz: { select: { title: true, type: true, subject: true } } },
            }),
            this.prisma.courseEnrollment.findMany({
                where: { userId },
                include: { course: { select: { title: true } } },
            }),
        ]);

        // Aggregate exam stats
        const examStats = {
            total: examSessions.length,
            averageScore: examSessions.length
                ? parseFloat((examSessions.reduce((s, e) => s + (e.percentage ?? 0), 0) / examSessions.length).toFixed(1))
                : 0,
            bestScore: examSessions.length ? Math.max(...examSessions.map((e) => e.percentage ?? 0)) : 0,
            recent: examSessions.slice(0, 5),
        };

        // Aggregate quiz stats
        const quizStats = {
            total: quizAttempts.length,
            averageScore: quizAttempts.length
                ? parseFloat((quizAttempts.reduce((s, q) => s + (q.score ?? 0), 0) / quizAttempts.length).toFixed(1))
                : 0,
            recent: quizAttempts.slice(0, 5),
        };

        const courseStats = {
            enrolled: enrollments.length,
            completed: enrollments.filter((e) => (e as any).completedAt !== null).length,
            inProgress: enrollments.filter((e) => (e as any).progress > 0 && (e as any).completedAt === null).length,
        };

        return { examStats, quizStats, courseStats };
    }

    // ─── Platform Analytics (Super Admin) ──────────────────────────────────────
    async getPlatformAnalytics() {
        const [userStats, contentStats, activityStats] = await Promise.all([
            // User breakdown
            Promise.all([
                this.prisma.user.count(),
                this.prisma.user.groupBy({ by: ['role'], _count: { id: true } }),
                this.prisma.user.groupBy({ by: ['status'], _count: { id: true } }),
                this.prisma.user.groupBy({ by: ['examCategory'], _count: { id: true } }),
            ]),
            // Content counts
            Promise.all([
                this.prisma.exam.count({ where: { isActive: true } }),
                this.prisma.quiz.count({ where: { isActive: true } }),
                this.prisma.course.count({ where: { isActive: true } }),
                this.prisma.blog.count({ where: { status: 'PUBLISHED' } }),
                this.prisma.currentAffair.count({ where: { isActive: true } }),
                this.prisma.download.count({ where: { isActive: true } }),
            ]),
            // Activity in the last 30 days
            Promise.all([
                this.prisma.examSession.count({
                    where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
                }),
                this.prisma.quizAttempt.count({
                    where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
                }),
                this.prisma.user.count({
                    where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
                }),
            ]),
        ]);

        const [totalUsers, byRole, byStatus, byCategory] = userStats;
        const [exams, quizzes, courses, blogs, currentAffairs, downloads] = contentStats;
        const [examSessions30d, quizAttempts30d, newUsers30d] = activityStats;

        return {
            users: {
                total: totalUsers,
                byRole: Object.fromEntries(byRole.map((r) => [r.role, r._count.id])),
                byStatus: Object.fromEntries(byStatus.map((s) => [s.status, s._count.id])),
                byExamCategory: Object.fromEntries(byCategory.filter((c) => c.examCategory).map((c) => [c.examCategory!, c._count.id])),
                newLast30Days: newUsers30d,
            },
            content: { exams, quizzes, courses, blogs, currentAffairs, downloads },
            activity30Days: {
                examSessions: examSessions30d,
                quizAttempts: quizAttempts30d,
                newUsers: newUsers30d,
            },
        };
    }

    // ─── Business Analytics (Owner) ────────────────────────────────────────────
    async getBusinessAnalytics() {
        const [revenueData, subscriptionStats, topExams, topQuizzes] = await Promise.all([
            // Revenue from active subscriptions
            this.prisma.subscription.findMany({
                where: { status: 'ACTIVE' },
                include: { plan: { select: { name: true, price: true } } },
            }),
            // Subscription growth
            this.prisma.subscription.groupBy({
                by: ['status'],
                _count: { id: true },
            }),
            // Top exams by sessions
            this.prisma.exam.findMany({
                take: 5,
                include: { _count: { select: { sessions: true } } },
                orderBy: { sessions: { _count: 'desc' } },
            }),
            // Top quizzes by attempts
            this.prisma.quiz.findMany({
                take: 5,
                include: { _count: { select: { attempts: true } } },
                orderBy: { attempts: { _count: 'desc' } },
            }),
        ]);

        const totalRevenue = revenueData.reduce((sum, sub) => sum + (sub.plan?.price ?? 0), 0);

        return {
            revenue: {
                total: totalRevenue,
                activeSubscribers: revenueData.length,
            },
            subscriptions: Object.fromEntries(subscriptionStats.map((s) => [s.status, s._count.id])),
            topExams,
            topQuizzes,
        };
    }

    // ─── Leaderboard (top students by exam performance) ────────────────────────
    async getLeaderboard(examId?: string, limit = 20) {
        const where: any = { isSubmitted: true };
        if (examId) where.examId = examId;

        const sessions = await this.prisma.examSession.findMany({
            where,
            orderBy: { percentage: 'desc' },
            take: limit,
            distinct: ['userId'],
            include: {
                user: { select: { id: true, name: true, avatar: true, examCategory: true } },
                exam: { select: { id: true, title: true } },
            },
        });

        return sessions.map((s, idx) => ({
            rank: idx + 1,
            user: s.user,
            exam: s.exam,
            score: s.score,
            totalMarks: s.totalMarks,
            percentage: s.percentage,
        }));
    }
}
