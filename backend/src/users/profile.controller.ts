import {
  Controller,
  Get,
  Patch,
  Body,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { PrismaService } from '../prisma/prisma.service.js';
import * as bcrypt from 'bcrypt';
import { Prisma } from '../generated/prisma/client.js';

interface AuthRequest extends Request {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

@Controller('users')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private prisma: PrismaService) {}

  @Get('me')
  async getMe(@Req() req: AuthRequest) {
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        createdAt: true,
      },
    });
    return user;
  }

  @Patch('me')
  async updateProfile(@Req() req: AuthRequest, @Body() body: { name: string }) {
    return this.prisma.user.update({
      where: { id: req.user.id },
      data: { name: body.name },
      select: { id: true, name: true, email: true, role: true },
    });
  }

  @Patch('me/password')
  async updatePassword(
    @Req() req: AuthRequest,
    @Body() body: { oldPassword: string; newPassword: string },
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user?.password) {
      throw new BadRequestException(
        'Cannot change password for OAuth accounts',
      );
    }

    const isValid = await bcrypt.compare(body.oldPassword, user.password);
    if (!isValid) {
      throw new BadRequestException('Old password is incorrect');
    }

    if (!body.newPassword || body.newPassword.length < 6) {
      throw new BadRequestException(
        'New password must be at least 6 characters',
      );
    }

    const hashed = await bcrypt.hash(body.newPassword, 12);
    await this.prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashed },
    });

    return { message: 'Password updated successfully' };
  }

  @Patch('me/avatar')
  async updateAvatar(
    @Req() req: AuthRequest,
    @Body() body: { avatar: Prisma.InputJsonValue },
  ) {
    const updated = await this.prisma.user.update({
      where: { id: req.user.id },
      data: { avatar: body.avatar },
      select: { id: true, avatar: true },
    });
    return updated;
  }
}
