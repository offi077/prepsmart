import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client.js';

@Injectable()
export class PrismaService
    extends PrismaClient
    implements OnModuleInit, OnModuleDestroy {
    constructor() {
        // Prisma v7 with `prisma-client` generator uses a WASM-based client engine
        // which requires a driver adapter instead of the old Rust query engine binary.
        const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore — generated types are strict but runtime accepts adapter option
        super({ adapter });
    }

    async onModuleInit() {
        await this.$connect();
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}
