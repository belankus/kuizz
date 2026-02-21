import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';
import { GoogleStrategy } from './strategies/google.strategy.js';
import { GithubStrategy } from './strategies/github.strategy.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
    imports: [
        PrismaModule,
        PassportModule,
        JwtModule.register({}), // secrets injected per-call via ConfigService
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy, GoogleStrategy, GithubStrategy],
    exports: [AuthService],
})
export class AuthModule { }
