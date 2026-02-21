import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-github2';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service.js';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
    private readonly logger = new Logger(GithubStrategy.name);

    constructor(
        config: ConfigService,
        private authService: AuthService,
    ) {
        const clientID = config.get<string>('GITHUB_CLIENT_ID') || 'DISABLED';
        const clientSecret = config.get<string>('GITHUB_CLIENT_SECRET') || 'DISABLED';
        super({
            clientID,
            clientSecret,
            callbackURL: config.get<string>(
                'GITHUB_CALLBACK_URL',
                'http://localhost:3001/auth/github/callback',
            ),
            scope: ['user:email'],
        });
        if (clientID === 'DISABLED') {
            this.logger.warn('GitHub OAuth disabled — set GITHUB_CLIENT_ID in .env');
        }
    }


    async validate(
        _accessToken: string,
        _refreshToken: string,
        profile: Profile,
        done: (error: any, user?: any) => void,
    ) {
        const { id, emails, displayName, username } = profile;
        const email = emails?.[0]?.value;

        if (!email) {
            return done(new Error('No email from GitHub. Make sure your GitHub email is public.'), undefined);
        }

        const user = await this.authService.validateOAuthUser({
            email,
            name: displayName || username || email,
            provider: 'github',
            providerId: id,
        });

        return done(null, user);
    }
}
