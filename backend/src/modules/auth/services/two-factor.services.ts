import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TwoFactorService {
  constructor(private configService: ConfigService) {}

  /**
   * Generate a new 2FA secret for a user
   */
  generateSecret(email: string): { secret: string; otpauthUrl: string } {
    const secret = speakeasy.generateSecret({
      name: `${this.configService.get('APP_NAME')} (${email})`,
      issuer: this.configService.get('APP_NAME'),
      length: 32,
    });

    return {
      secret: secret.base32!,
      otpauthUrl: secret.otpauth_url!,
    };
  }

  /**
   * Generate QR code for 2FA setup
   */
  async generateQRCode(otpauthUrl: string): Promise<string> {
    try {
      return await QRCode.toDataURL(otpauthUrl);
    } catch (error) {
      throw new BadRequestException('Failed to generate QR code');
    }
  }

  /**
   * Verify a 2FA token
   */
  verifyToken(secret: string, token: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2, // Allow 2 time steps before and after
    });
  }

  /**
   * Generate a backup code (for when user loses access to 2FA device)
   */
  generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      // Generate 8-character alphanumeric codes
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  /**
   * Generate a temporary 2FA code for email/SMS delivery
   */
  generateTemporaryCode(): { code: string; expiresAt: Date } {
    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Code expires in 5 minutes
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    return { code, expiresAt };
  }

  /**
   * Verify temporary code (for email/SMS 2FA)
   */
  verifyTemporaryCode(
    storedCode: string,
    providedCode: string,
    expiresAt: Date,
  ): boolean {
    if (new Date() > expiresAt) {
      throw new UnauthorizedException('2FA code has expired');
    }

    if (storedCode !== providedCode) {
      return false;
    }

    return true;
  }
}
