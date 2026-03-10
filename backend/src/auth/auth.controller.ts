import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';
import type { Request } from 'express';
import { AuthService } from './auth.service.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { CurrentUser } from './decorators/current-user.decorator.js';
import { ConfigService } from '@nestjs/config';

interface OAuthUser {
  id: string;
  email: string;
  role: string;
  name: string | null;
}

interface OAuthRequest extends Request {
  user: OAuthUser;
}

const isProd = process.env.NODE_ENV === 'production';
const ACCESS_COOKIE = 'accessToken';
const REFRESH_COOKIE = 'refreshToken';

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: isProd ? ('none' as const) : ('lax' as const),
  secure: isProd, // set true in production (HTTPS)
  domain: isProd ? '.kuizz.my.id' : undefined,
};

console.log(process.env.NODE_ENV);
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private config: ConfigService,
  ) {}

  private setCookies(res: Response, accessToken: string, refreshToken: string) {
    res.cookie(ACCESS_COOKIE, accessToken, {
      ...COOKIE_OPTIONS,
      httpOnly: false, // Biar bisa dibaca client (auth helper)
      maxAge: 15 * 60 * 1000, // 15 minutes
    });
    res.cookie(REFRESH_COOKIE, refreshToken, {
      ...COOKIE_OPTIONS,
      httpOnly: true, // Tetap aman di backend
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  // ─── Email/Password ──────────────────────────────────────────────────────────

  @Post('register')
  async register(
    @Body() body: { email: string; password: string; name?: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, accessToken, refreshToken } = await this.authService.register(
      body.email,
      body.password,
      body.name,
    );
    this.setCookies(res, accessToken, refreshToken);
    return { user, accessToken };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() body: { email: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, accessToken, refreshToken } = await this.authService.login(
      body.email,
      body.password,
    );
    this.setCookies(res, accessToken, refreshToken);
    return { user, accessToken };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(
    @CurrentUser() user: { id: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(user.id);
    res.clearCookie(ACCESS_COOKIE);
    res.clearCookie(REFRESH_COOKIE);
    return { message: 'Logged out successfully' };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = req.cookies?.[REFRESH_COOKIE] as string | undefined;
    if (!token) throw new UnauthorizedException('No refresh token');

    // Decode without verify to get userId (verify is done in service)
    let userId: string;
    try {
      const decoded = JSON.parse(
        Buffer.from(token.split('.')[1], 'base64').toString(),
      ) as { sub: string };
      userId = decoded.sub;
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const { accessToken, refreshToken } = await this.authService.refreshTokens(
      userId,
      token,
    );
    this.setCookies(res, accessToken, refreshToken);
    return { accessToken };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@CurrentUser() user: { id: string }) {
    return this.authService.getMe(user.id);
  }

  // ─── Google OAuth ────────────────────────────────────────────────────────────

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {
    // Redirected to Google by passport
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: OAuthRequest, @Res() res: Response) {
    const user = req.user;
    const { accessToken, refreshToken } =
      await this.authService.handleOAuthLogin(
        user.id,
        user.email,
        user.role,
        user.name,
      );
    this.setCookies(res, accessToken, refreshToken);
    const frontendUrl = this.config.get<string>(
      'FRONTEND_URL',
      'http://localhost:3000',
    );
    return res.redirect(`${frontendUrl}/auth/callback`);
  }

  // ─── GitHub OAuth ────────────────────────────────────────────────────────────

  @Get('github')
  @UseGuards(AuthGuard('github'))
  githubAuth() {
    // Redirected to GitHub by passport
  }

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubCallback(@Req() req: OAuthRequest, @Res() res: Response) {
    const user = req.user;
    const { accessToken, refreshToken } =
      await this.authService.handleOAuthLogin(
        user.id,
        user.email,
        user.role,
        user.name,
      );
    this.setCookies(res, accessToken, refreshToken);
    const frontendUrl = this.config.get<string>(
      'FRONTEND_URL',
      'http://localhost:3000',
    );
    return res.redirect(`${frontendUrl}/auth/callback`);
  }
}
