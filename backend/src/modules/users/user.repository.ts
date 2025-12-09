import { Injectable } from '@nestjs/common';
import { Prisma, RefreshToken, User } from 'src/generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserRepository {
  constructor(private prisma: PrismaService) {}

  // ===========================
  // Users
  // ===========================
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data });
  }

  async update(userId: string, data: Prisma.UserUpdateInput): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data,
    });
    return user;
  }

  // ===========================
  // Failed login / account lock
  // ===========================
  async incrementFailedLoginAttempts(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { failedLoginAttempts: { increment: 1 } },
    });
  }

  async lockAccount(userId: string, until: Date) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        accountLockedUntil: until,
        failedLoginAttempts: 0,
      },
    });
  }

  async resetFailedLoginAttempts(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: 0,
        accountLockedUntil: null,
      },
    });
  }

  async updateLastLogin(userId: string, ip: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        lastLoginAt: new Date(),
        lastLoginIp: ip,
      },
    });
  }

  // ===========================
  // Email Verification
  // ===========================
  async setEmailVerificationToken(
    userId: string,
    token: string,
    expiresAt: Date,
  ) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        emailVerificationToken: token,
        emailVerificationTokenExpires: expiresAt,
      },
    });
  }

  async findByEmailVerificationToken(token: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { emailVerificationToken: token },
    });
  }

  async verifyEmail(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationTokenExpires: null,
      },
    });
  }

  // ===========================
  // Password Reset
  // ===========================
  async setPasswordResetToken(userId: string, token: string, expiresAt: Date) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordResetToken: token,
        passwordResetTokenExpires: expiresAt,
      },
    });
  }

  async findByPasswordResetToken(token: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { passwordResetToken: token },
    });
  }

  async clearPasswordResetToken(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordResetToken: null,
        passwordResetTokenExpires: null,
      },
    });
  }

  // ===========================
  // 2FA
  // ===========================
  async enable2FA(userId: string, secret: string, backupCodes: string[]) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: true,
        twoFactorSecret: secret,
        twoFactorBackupCodes: backupCodes,
        twoFactorTempSecret: null,
      },
    });
  }

  async disable2FA(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorBackupCodes: undefined,
      },
    });
  }

  async setTempAuthToken(userId: string, token: string, expiresAt: Date) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        tempAuthToken: token,
        tempAuthTokenExpires: expiresAt,
      },
    });
  }

  async findByTempAuthToken(token: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { tempAuthToken: token },
    });
  }

  async clearTempAuthToken(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        tempAuthToken: null,
        tempAuthTokenExpires: null,
      },
    });
  }

  // ===========================
  // Refresh Tokens
  // ===========================
  async saveRefreshToken(userId: string, token: string, expiresAt: Date) {
    return this.prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });
  }

  async findRefreshToken(token: string): Promise<RefreshToken | null> {
    return this.prisma.refreshToken.findUnique({
      where: { token },
    });
  }

  async revokeRefreshToken(token: string) {
    return this.prisma.refreshToken.delete({ where: { token } });
  }

  async getProfile(userId: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id: userId },
    });
  }
}
