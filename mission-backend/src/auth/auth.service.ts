import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { UserRole } from '../../generated/prisma/enums.js';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
    ) { }

    async register(dto: RegisterDto) {
        const existing = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (existing) {
            throw new ConflictException('Email already in use');
        }

        const passwordHash = await bcrypt.hash(dto.password, 10);

        const user = await this.prisma.user.create({
            data: {
                name: dto.name,
                email: dto.email,
                passwordHash,
                role: (dto.role as unknown as UserRole) || UserRole.STUDENT,
                targetExam: dto.targetExam,
                secondaryExam: dto.secondaryExam,
                examCategory: dto.examCategory,
                state: dto.state,
            },
        });

        const token = this.generateToken(user.id, user.email, user.role);

        return {
            user: this.sanitizeUser(user),
            access_token: token,
        };
    }

    async login(dto: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid email or password');
        }

        const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid email or password');
        }

        const token = this.generateToken(user.id, user.email, user.role);

        return {
            user: this.sanitizeUser(user),
            access_token: token,
        };
    }

    async getProfile(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        return this.sanitizeUser(user);
    }

    private generateToken(userId: string, email: string, role: UserRole): string {
        const payload = { sub: userId, email, role };
        return this.jwtService.sign(payload);
    }

    private sanitizeUser(user: any) {
        const { passwordHash, ...result } = user;
        return result;
    }
}
