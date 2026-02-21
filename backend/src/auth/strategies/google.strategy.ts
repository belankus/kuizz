import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service.js';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly logger = new Logger(GoogleStrategy.name);

  constructor(
    config: ConfigService,
    private authService: AuthService,
  ) {
    const clientID = config.get<string>('GOOGLE_CLIENT_ID') || 'DISABLED';
    const clientSecret =
      config.get<string>('GOOGLE_CLIENT_SECRET') || 'DISABLED';
    super({
      clientID,
      clientSecret,
      callbackURL: config.get<string>(
        'GOOGLE_CALLBACK_URL',
        'http://localhost:3001/auth/google/callback',
      ),
      scope: ['email', 'profile'],
    });
    if (clientID === 'DISABLED') {
      this.logger.warn('Google OAuth disabled — set GOOGLE_CLIENT_ID in .env');
    }
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ) {
    const { id, emails, displayName } = profile;
    const email = emails?.[0]?.value;

    if (!email) {
      return done(new Error('No email from Google'), undefined);
    }

    const user = await this.authService.validateOAuthUser({
      email,
      name: displayName,
      provider: 'google',
      providerId: id,
    });

    return done(null, user);
  }
}
