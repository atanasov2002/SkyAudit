import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { EmailService } from './services/email.service';
import { TwoFactorService } from './services/two-factor.services';
import { GoogleStrategy } from './strategies/google.strategy';
import { GithubStrategy } from './strategies/github.strategy';
import { MicrosoftStrategy } from './strategies/microsoft.strategy';
import { OAuthService } from './services/oauth.service';
import { UsersModule } from 'src/modules/users/users.module';
import { UserSessionRepository } from './repositories/user-session.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserRepository } from '../users/user.repository';

@Module({
  imports: [
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRES_IN', '15m'),
        },
      }),
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 5, // 5 requests per minute
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [
    PrismaService,
    AuthService,
    EmailService,
    TwoFactorService,
    //OAuthService,
    UserSessionRepository,
    JwtStrategy,
    RefreshTokenStrategy,
    LocalStrategy,
    // GoogleStrategy,
    // GithubStrategy,
    // MicrosoftStrategy,
  ],
  exports: [AuthService, JwtStrategy],
})
export class AuthModule {}
