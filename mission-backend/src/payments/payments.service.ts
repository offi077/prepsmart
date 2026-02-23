import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreatePlanDto, UpdatePlanDto, CreateSubscriptionDto } from './dto/payment.dto.js';

@Injectable()
export class PaymentsService {
    constructor(private readonly prisma: PrismaService) { }

    // ─── Payment Plans (admin/owner CRUD) ────────────────────────────────────
    async createPlan(dto: CreatePlanDto) {
        return this.prisma.paymentPlan.create({ data: dto as any });
    }

    async findAllPlans(activeOnly = true) {
        return this.prisma.paymentPlan.findMany({
            where: activeOnly ? { isActive: true } : {},
            orderBy: { price: 'asc' },
        });
    }

    async findOnePlan(id: string) {
        const plan = await this.prisma.paymentPlan.findUnique({ where: { id } });
        if (!plan) throw new NotFoundException('Payment plan not found');
        return plan;
    }

    async updatePlan(id: string, dto: UpdatePlanDto) {
        await this.findOnePlan(id);
        return this.prisma.paymentPlan.update({ where: { id }, data: dto as any });
    }

    async deletePlan(id: string) {
        await this.findOnePlan(id);
        await this.prisma.paymentPlan.delete({ where: { id } });
        return { message: 'Plan deleted' };
    }

    // ─── Subscriptions ────────────────────────────────────────────────────────
    async subscribe(userId: string, dto: CreateSubscriptionDto) {
        const plan = await this.findOnePlan(dto.planId);

        // Cancel any active subscription first
        await this.prisma.subscription.updateMany({
            where: { userId, status: 'ACTIVE' },
            data: { status: 'CANCELLED' },
        });

        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + plan.duration);

        return this.prisma.subscription.create({
            data: {
                userId,
                planId: dto.planId,
                startDate,
                endDate,
                status: 'ACTIVE',
            },
            include: { plan: true },
        });
    }

    async getMySubscription(userId: string) {
        return this.prisma.subscription.findFirst({
            where: { userId, status: 'ACTIVE' },
            include: { plan: true },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getMySubscriptionHistory(userId: string) {
        return this.prisma.subscription.findMany({
            where: { userId },
            include: { plan: { select: { name: true, price: true, duration: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }

    async cancelSubscription(userId: string) {
        const sub = await this.prisma.subscription.findFirst({
            where: { userId, status: 'ACTIVE' },
        });
        if (!sub) throw new NotFoundException('No active subscription found');

        return this.prisma.subscription.update({
            where: { id: sub.id },
            data: { status: 'CANCELLED' },
        });
    }

    // ─── Admin: all subscriptions (paginated) ─────────────────────────────────
    async getAllSubscriptions(page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.prisma.subscription.findMany({
                skip, take: limit, orderBy: { createdAt: 'desc' },
                include: {
                    user: { select: { id: true, name: true, email: true } },
                    plan: { select: { name: true, price: true } },
                },
            }),
            this.prisma.subscription.count(),
        ]);
        return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    }

    // ─── Revenue summary (owner/super-admin) ─────────────────────────────────
    async getRevenueSummary() {
        const [totalSubs, activeSubs, planRevenue] = await Promise.all([
            this.prisma.subscription.count(),
            this.prisma.subscription.count({ where: { status: 'ACTIVE' } }),
            this.prisma.subscription.groupBy({
                by: ['planId'],
                _count: { id: true },
                where: { status: 'ACTIVE' },
            }),
        ]);

        // Enrich plan revenue with plan details
        const plans = await this.prisma.paymentPlan.findMany({ select: { id: true, name: true, price: true } });
        const planMap = Object.fromEntries(plans.map((p) => [p.id, p]));

        const revenueByPlan = planRevenue.map((r) => ({
            plan: planMap[r.planId],
            subscribers: r._count.id,
            revenue: (planMap[r.planId]?.price ?? 0) * r._count.id,
        }));

        const totalRevenue = revenueByPlan.reduce((sum, r) => sum + r.revenue, 0);

        return { totalRevenue, totalSubs, activeSubs, revenueByPlan };
    }
}
