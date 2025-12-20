import { User } from 'src/generated/prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
  interface RequestWithUser extends Request {
    user: {
      id: string;
      email: string;
      name: string;
      isActive: boolean;
      failedLoginAttempts: number;
      accountLockedUntil: Date | null;
      lastLoginAt: Date | null;
      lastLoginIp: string | null;
      oauthProvider: string | null;
      oauthId: string | null;
      profilePictureUrl: string | null;
      twoFactorEnabled: boolean;
      createdAt: Date;
      updatedAt: Date;
    };
  }
}
