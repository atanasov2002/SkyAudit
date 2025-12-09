import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UserRepository } from 'src/modules/users/user.repository';
import { TwoFactorService } from './services/two-factor.services';
import { EmailService } from './services/email.service';
import { OAuthService } from './services/oauth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Verify2FADto } from './dto/verify-2fa.dto';
import {
  isAccountLocked,
  isEmailVerificationExpired,
  isPasswordResetExpired,
  isRefreshTokenValid,
} from '../users/helpers/user.helper';
import { User } from 'src/generated/prisma/client';
import { UserSessionRepository } from './repositories/user-session.repository';

type Session = {
  id: string;
  userId: string;
  refreshTokenHash: string;
  expiresAt: Date;
  userAgent?: string;
  ip?: string;
};

// Define the return types
interface TwoFactorLogin {
  requiresTwoFactor: true;
  tempToken: string;
  message: string;
}

interface NormalLogin {
  requiresTwoFactor: false;
  user: {
    id: string;
    name: string;
    email: string;
    isEmailVerified: boolean;
  };
  accessToken: string;
  refreshToken: string;
  refreshTokenHash?: string;
  message: string;
  redirect: string;
}

type LoginResult = TwoFactorLogin | NormalLogin;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly saltRounds = 12;

  constructor(
    private readonly userRepository: UserRepository,
    private readonly userSessionRepository: UserSessionRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly twoFactorService: TwoFactorService,
    private readonly emailService: EmailService,
    private readonly oauthService: OAuthService,
  ) {}

  // ========================
  // Register
  // ========================
  async register(
    registerDto: RegisterDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { email, password, name } = registerDto;

    // Check if user exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser)
      throw new ConflictException('User with this email already exists');

    // Validate password
    this.validatePasswordStrength(password);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, this.saltRounds);

    // Create user
    const user = await this.userRepository.create({
      email,
      name,
      password: hashedPassword,
      isEmailVerified: false,
    });

    // Generate email verification token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await this.userRepository.setEmailVerificationToken(
      user.id,
      token,
      expiresAt,
    );

    await this.emailService.sendVerificationEmail(user.email, token, user.name);
    this.logger.log(`User registered: ${email}`);

    return this.generateTokens(user.id, user.email);
  }

  async login(
    loginDto: LoginDto,
    ipAddress: string,
    userAgent: string,
  ): Promise<LoginResult> {
    const { email, password } = loginDto;
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    if (isAccountLocked(user))
      throw new UnauthorizedException('Account temporarily locked');

    const isPasswordValid = await bcrypt.compare(password, user.password!);
    if (!isPasswordValid) {
      await this.handleFailedLogin(user);
      throw new UnauthorizedException('Invalid credentials');
    }

    // ===== 2FA Step 1 =====
    if (user.twoFactorEnabled) {
      const tempToken = crypto.randomBytes(32).toString('hex');
      await this.userRepository.setTempAuthToken(
        user.id,
        tempToken,
        new Date(Date.now() + 5 * 60 * 1000),
      );

      return {
        requiresTwoFactor: true,
        tempToken,
        message: '2FA required',
      };
    }

    // ===== Normal login =====
    await this.userRepository.updateLastLogin(user.id, ipAddress ?? 'unknown');
    await this.userRepository.resetFailedLoginAttempts(user.id);

    const { accessToken, refreshToken, refreshTokenHash } =
      await this.generateTokens(user.id, user.email);

    await this.userSessionRepository.createSession({
      userId: user.id,
      refreshTokenHash,
      ip: ipAddress,
      userAgent,
      expiresAt: new Date(Date.now() + 7 * 24 * 3600_000),
    });

    return {
      message: 'Login successful',
      requiresTwoFactor: false,
      redirect: '/dashboard',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
      },
    };
  }

  // ========================
  // Email Verification
  // ========================
  async verifyEmail(token: string) {
    const user = await this.userRepository.findByEmailVerificationToken(token);
    if (!user) throw new BadRequestException('Invalid verification token');
    if (isEmailVerificationExpired(user))
      throw new BadRequestException('Verification token expired');

    await this.userRepository.verifyEmail(user.id);
    this.logger.log(`Email verified: ${user.email}`);
  }

  async resendVerificationEmail(user: {
    userId: string;
    email: string;
    name: string;
  }) {
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
    await this.userRepository.setEmailVerificationToken(
      user.userId,
      verificationToken,
      expiresAt,
    );
    await this.emailService.sendVerificationEmail(
      user.email,
      verificationToken,
      user.name,
    );
    this.logger.log(`Verification email resent: ${user.email}`);
  }

  // ========================
  // Password Reset
  // ========================
  async forgotPassword(email: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) return; // silently ignore

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min
    await this.userRepository.setPasswordResetToken(user.id, token, expiresAt);

    await this.emailService.sendPasswordResetEmail(
      user.email,
      token,
      user.name,
    );
    this.logger.log(`Password reset requested: ${email}`);
  }

  async resetPassword(resetDto: ResetPasswordDto) {
    const { token, newPassword } = resetDto;
    const user = await this.userRepository.findByPasswordResetToken(token);
    if (!user) throw new BadRequestException('Invalid reset token');
    if (isPasswordResetExpired(user))
      throw new BadRequestException('Reset token expired');

    this.validatePasswordStrength(newPassword);
    const hashedPassword = await bcrypt.hash(newPassword, this.saltRounds);
    await this.userRepository.update(user.id, { password: hashedPassword });
    await this.userRepository.clearPasswordResetToken(user.id);

    await this.emailService.sendPasswordChangedNotification(
      user.email,
      user.name,
    );
    this.logger.log(`Password reset successful: ${user.email}`);
  }

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');

    const isValid = await bcrypt.compare(oldPassword, user.password!);
    if (!isValid)
      throw new UnauthorizedException('Current password is incorrect');

    this.validatePasswordStrength(newPassword);
    const hashedPassword = await bcrypt.hash(newPassword, this.saltRounds);
    await this.userRepository.update(user.id, { password: hashedPassword });
    await this.emailService.sendPasswordChangedNotification(
      user.email,
      user.name,
    );

    this.logger.log(`Password changed: ${user.email}`);
  }

  // ========================
  // Two-Factor Authentication
  // ========================
  async enable2FA(userId: string) {
    const user = await this.userRepository.findById(userId);

    if (!user) throw new NotFoundException('User not found');

    const { secret, otpauthUrl } = this.twoFactorService.generateSecret(
      user.email,
    );
    const qrCode = await this.twoFactorService.generateQRCode(otpauthUrl);
    await this.userRepository.update(userId, { twoFactorTempSecret: secret });
    this.logger.log(`2FA setup initiated: ${user.email}`);
    return { qrCode, secret };
  }

  async verify2FASetup(dto: Verify2FADto) {
    const { email, tempToken, code } = dto;
    const user = await this.userRepository.findByEmail(email);

    if (!user) throw new UnauthorizedException('Invalid request');

    if (!user.twoFactorTempSecret)
      throw new BadRequestException('2FA not initiated');

    if (!this.twoFactorService.verifyToken(user.twoFactorTempSecret, tempToken))
      throw new UnauthorizedException('Invalid 2FA token');

    const backupCodes = this.twoFactorService.generateBackupCodes();
    const hashedCodes = await Promise.all(
      backupCodes.map((c) => bcrypt.hash(c, 10)),
    );

    await this.userRepository.enable2FA(
      user.id,
      user.twoFactorTempSecret,
      hashedCodes,
    );
    this.logger.log(`2FA enabled: ${user.email}`);
    return backupCodes;
  }

  async disable2FA(userId: string, token: string) {
    const user = await this.userRepository.findById(userId);

    if (!user) throw new NotFoundException('User not found');

    if (!this.twoFactorService.verifyToken(user.twoFactorSecret!, token))
      throw new UnauthorizedException('Invalid 2FA token');

    await this.userRepository.disable2FA(userId);
    this.logger.log(`2FA disabled: ${user.email}`);
  }

  async validate2FAToken(email: string, token: string, tempToken: string) {
    const user = await this.userRepository.findByTempAuthToken(tempToken);
    if (!user || user.email !== email)
      throw new UnauthorizedException('Invalid session');

    if (!this.twoFactorService.verifyToken(user.twoFactorSecret!, token))
      throw new UnauthorizedException('Invalid 2FA token');

    await this.userRepository.clearTempAuthToken(user.id);
    return this.generateTokens(user.id, user.email);
  }

  // ========================
  // OAuth
  // ========================
  async handleOAuthLogin(oauthUser: any, provider: string) {
    let result;
    switch (provider) {
      case 'google':
        result = await this.oauthService.googleLogin(oauthUser);
        break;
      case 'github':
        result = await this.oauthService.githubLogin(oauthUser);
        break;
      case 'microsoft':
        result = await this.oauthService.microsoftLogin(oauthUser);
        break;
      default:
        throw new BadRequestException('Unsupported OAuth provider');
    }
    return this.oauthService.generateOAuthTokens(result.userId, result.email);
  }

  // ========================
  // Token Management
  // ========================
  async refreshAccessToken(refreshTokenDto: { refreshToken: string }) {
    const { refreshToken } = refreshTokenDto;

    // Find the session by hashing the incoming token
    const sessions = (await this.userSessionRepository.findByUserId(
      await this.getUserIdFromToken(refreshToken),
    )) as any;

    // Verify the refresh token matches a stored session
    let validSession: any = null;
    for (const session of sessions) {
      const isValid = await bcrypt.compare(
        refreshToken,
        session.refreshTokenHash,
      );
      if (isValid && new Date() < session.expiresAt) {
        validSession = session;
        break;
      }
    }

    if (!validSession) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.userRepository.findById(validSession.userId);
    if (!user) throw new NotFoundException('User not found');

    // ⚠️ IMPORTANT: Delete the old session (token rotation)
    await this.userSessionRepository.deleteSession(validSession.id);

    // Generate NEW access token AND NEW refresh token
    const {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      refreshTokenHash: newRefreshTokenHash,
    } = await this.generateTokens(user.id, user.email);

    // Create NEW session with new refresh token
    await this.userSessionRepository.createSession({
      userId: user.id,
      refreshTokenHash: newRefreshTokenHash,
      ip: validSession.ip,
      userAgent: validSession.userAgent,
      expiresAt: new Date(Date.now() + 7 * 24 * 3600_000),
    });

    this.logger.log(`Token rotated for user: ${user.email}`);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(refreshToken: string) {
    try {
      // Find and delete ALL sessions with this refresh token
      const userId = await this.getUserIdFromToken(refreshToken);
      const sessions: any =
        await this.userSessionRepository.findByUserId(userId);

      for (const session of sessions) {
        const isMatch = await bcrypt.compare(
          refreshToken,
          session.refreshTokenHash,
        );
        if (isMatch) {
          await this.userSessionRepository.deleteSession(session.id);
          this.logger.log(`Session revoked for user: ${userId}`);
          break;
        }
      }
    } catch (error) {
      this.logger.error('Logout error:', error);
    }
  }

  // ============================================
  // LOGOUT ALL DEVICES
  // ============================================
  async logoutAllDevices(userId: string) {
    await this.userSessionRepository.deleteAllSessionsForUser(userId);
    this.logger.log(`All sessions revoked for user: ${userId}`);
  }

  // ========================
  // Helpers
  // ========================
  private validatePasswordStrength(password: string) {
    if (password.length < 8)
      throw new BadRequestException('Password too short');
    if (
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password) ||
      !/\d/.test(password) ||
      !/[!@#$%^&*]/.test(password)
    )
      throw new BadRequestException(
        'Password must include upper, lower, number, special',
      );
  }

  private async handleFailedLogin(user: User) {
    const maxAttempts = 5;
    const lockTime = 30 * 60 * 1000;
    const attempts = (user.failedLoginAttempts || 0) + 1;

    if (attempts >= maxAttempts) {
      await this.userRepository.lockAccount(
        user.id,
        new Date(Date.now() + lockTime),
      );
      this.logger.warn(`Account locked: ${user.email}`);
    } else {
      await this.userRepository.incrementFailedLoginAttempts(user.id);
    }
  }

  async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_EXPIRES_IN', '15m'),
    });

    const refreshToken = crypto.randomBytes(48).toString('hex');
    const refreshTokenHash = await bcrypt.hash(refreshToken, 12);

    return { accessToken, refreshToken, refreshTokenHash };
  }

  // Helper to decode user ID from potential JWT or find by refresh token
  private async getUserIdFromToken(token: string): Promise<string> {
    try {
      // Try decoding as JWT (access token)
      const decoded = this.jwtService.verify(token);
      return decoded.sub;
    } catch {
      // If not JWT, it's a refresh token - need to query DB
      // For now, throw error - in production you'd query sessions table
      throw new UnauthorizedException('Invalid token format');
    }
  }

  async validateUser(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) return null;

    const isPasswordValid = await bcrypt.compare(password, user.password!);
    if (!isPasswordValid) return null;

    return user;
  }
}
