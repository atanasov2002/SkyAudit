import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserSessionRepository {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new session with a hashed refresh token
   */
  async createSession(params: {
    userId: string;
    refreshTokenHash: string;
    expiresAt: Date;
    userAgent?: string;
    ip?: string;
  }) {
    return this.prisma.userSession.create({
      data: {
        userId: params.userId,
        refreshTokenHash: params.refreshTokenHash,
        expiresAt: params.expiresAt,
        userAgent: params.userAgent,
        ip: params.ip,
      },
    });
  }

  // /**
  //  * Find a session by hashed refresh token
  //  */
  // async findByRefreshToken(hashedToken: string) {
  //   return this.prisma.userSession.findFirst({
  //     where: { refreshToken: hashedToken },
  //   });
  // }

  /**
   * Find a session by ID
   */
  async findById(id: string) {
    return this.prisma.userSession.findUnique({
      where: { id },
    });
  }

  /**
   * Find a session by User ID
   */
  async findByUserId(userId: string) {
    return this.prisma.userSession.findUnique({
      where: { id: undefined, userId: userId },
    });
  }

  /**
   * Rotate refresh token (replace old hashed token with new hashed token)
   */
  async rotateToken(
    sessionId: string,
    newHashedToken: string,
    newExpiresAt: Date,
  ) {
    return this.prisma.userSession.update({
      where: { id: sessionId },
      data: {
        refreshTokenHash: newHashedToken,
        expiresAt: newExpiresAt,
      },
    });
  }

  /**
   * Delete a session (user logs out from a device)
   */
  async deleteSession(sessionId: string) {
    return this.prisma.userSession.delete({
      where: { id: sessionId },
    });
  }

  /**
   * Delete ALL sessions for a user (logout from all devices)
   */
  async deleteAllSessionsForUser(userId: string) {
    return this.prisma.userSession.deleteMany({
      where: { userId },
    });
  }

  /**
   * Cleanup expired refresh tokens
   */
  async deleteExpiredSessions() {
    return this.prisma.userSession.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });
  }
}
