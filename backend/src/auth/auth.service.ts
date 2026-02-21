import {
    Injectable,
    UnauthorizedException,
    ConflictException,
    BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service.js';
import * as bcrypt from 'bcrypt';

export interface OAuthUserDto {
    email: string;
    name: string;
    provider: string;
    providerId: string;
}

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private config: ConfigService,
    ) { }

    // ─── Register ───────────────────────────────────────────────────────────────

    async register(email: string, password: string, name?: string) {
        const existing = await this.prisma.user.findUnique({ where: { email } });
        if (existing) {
            throw new ConflictException('Email already registered');
        }

        if (!password || password.length < 6) {
            throw new BadRequestException('Password must be at least 6 characters');
        }

        const hashed = await bcrypt.hash(password, 12);

        const user = await this.prisma.user.create({
            data: { email, password: hashed, name },
            select: { id: true, email: true, name: true, role: true },
        });

        const tokens = await this.generateTokens(user.id, user.email, user.role);
        await this.saveRefreshToken(user.id, tokens.refreshToken);

        return { user, ...tokens };
    }

    // ─── Login ──────────────────────────────────────────────────────────────────

    async login(email: string, password: string) {
        const user = await this.prisma.user.findUnique({ where: { email } });

        if (!user || !user.password) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const tokens = await this.generateTokens(user.id, user.email, user.role);
        await this.saveRefreshToken(user.id, tokens.refreshToken);

        return {
            user: { id: user.id, email: user.email, name: user.name, role: user.role },
            ...tokens,
        };
    }

    // ─── OAuth ──────────────────────────────────────────────────────────────────

    async validateOAuthUser(dto: OAuthUserDto) {
        let user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (!user) {
            user = await this.prisma.user.create({
                data: {
                    email: dto.email,
                    name: dto.name,
                    provider: dto.provider,
                    providerId: dto.providerId,
                },
            });
        } else if (!user.provider) {
            // user sudah register via email, link ke OAuth
            await this.prisma.user.update({
                where: { id: user.id },
                data: { provider: dto.provider, providerId: dto.providerId },
            });
        }

        return user;
    }

    async handleOAuthLogin(userId: string, email: string, role: string) {
        const tokens = await this.generateTokens(userId, email, role);
        await this.saveRefreshToken(userId, tokens.refreshToken);
        return tokens;
    }

    // ─── Refresh Token ──────────────────────────────────────────────────────────

    async refreshTokens(userId: string, incomingRefreshToken: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });

        if (!user || !user.refreshToken) {
            throw new UnauthorizedException('Access denied');
        }

        const matches = await bcrypt.compare(incomingRefreshToken, user.refreshToken);
        if (!matches) {
            throw new UnauthorizedException('Access denied — refresh token mismatch');
        }

        const tokens = await this.generateTokens(user.id, user.email, user.role);
        await this.saveRefreshToken(user.id, tokens.refreshToken);
        return tokens;
    }

    // ─── Logout ─────────────────────────────────────────────────────────────────

    async logout(userId: string) {
        await this.prisma.user.update({
            where: { id: userId },
            data: { refreshToken: null },
        });
    }

    // ─── Me ─────────────────────────────────────────────────────────────────────

    async getMe(userId: string) {
        return this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, name: true, role: true, createdAt: true },
        });
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────────

    private async generateTokens(userId: string, email: string, role: string) {
        const payload = { sub: userId, email, role };

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: this.config.get<string>('JWT_SECRET'),
                expiresIn: '15m',
            }),
            this.jwtService.signAsync(payload, {
                secret: this.config.get<string>('JWT_REFRESH_SECRET'),
                expiresIn: '7d',
            }),
        ]);

        return { accessToken, refreshToken };
    }

    private async saveRefreshToken(userId: string, refreshToken: string) {
        const hashed = await bcrypt.hash(refreshToken, 10);
        await this.prisma.user.update({
            where: { id: userId },
            data: { refreshToken: hashed },
        });
    }
}
