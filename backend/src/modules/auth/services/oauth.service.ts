import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class OAuthService {
  private readonly logger = new Logger(OAuthService.name);

  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
    // Inject your UserRepository here
    // private userRepository: UserRepository,
  ) {}

  async googleLogin(profile: any) {
    if (!profile) {
      throw new UnauthorizedException('No user from Google');
    }

    const { email, firstName, lastName, picture } = profile;

    this.logger.log(`Google OAuth login: ${email}`);

    return {
      userId: 'user-123',
      email,
      name: `${firstName} ${lastName}`,
    };
  }

  async githubLogin(profile: any) {
    if (!profile) {
      throw new UnauthorizedException('No user from GitHub');
    }

    const { email, username, displayName } = profile;

    if (!email) {
      throw new UnauthorizedException(
        'GitHub account must have a public email',
      );
    }

    this.logger.log(`GitHub OAuth login: ${email}`);

    return {
      userId: 'user-123',
      email,
      name: displayName || username,
    };
  }

  async microsoftLogin(profile: any) {
    if (!profile) {
      throw new UnauthorizedException('No user from Microsoft');
    }

    const { email, displayName } = profile;

    this.logger.log(`Microsoft OAuth login: ${email}`);

    return {
      userId: 'user-123',
      email,
      name: displayName,
    };
  }

  async generateOAuthTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const accessToken = this.jwtService.sign(payload);

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
      secret: this.configService.get('JWT_REFRESH_SECRET'),
    });

    return { accessToken, refreshToken };
  }
}
