import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
  Get,
  UseInterceptors,
  ClassSerializerInterceptor,
  Patch,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Verify2FADto } from './dto/verify-2fa.dto';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { GithubAuthGuard } from './guards/github-auth.guard';
import { MicrosoftAuthGuard } from './guards/microsoft-auth.guard';
import { JwtCookieAuthGuard } from './guards/jwt-cookie-auth.guard';

interface RequestWithUser extends Request {
  user: {
    id: string;
    name: string;
    userId: string;
    email: string;
    isEmailVerified: boolean;
    twoFactorEnabled: boolean;
    lastLoginAt: Date;
  };
}

const BASE_COOKIE_OPTIONS = {
  secure: false, // Set to true in production with HTTPS
  sameSite: 'lax' as const,
  path: '/',
};

// Access token should be readable by JavaScript for client-side auth checks
const ACCESS_TOKEN_OPTIONS = {
  ...BASE_COOKIE_OPTIONS,
  httpOnly: false, // ← Allow JavaScript access
  maxAge: 15 * 60 * 1000, // 15 minutes
};

// Refresh token should be httpOnly for security
const REFRESH_TOKEN_OPTIONS = {
  ...BASE_COOKIE_OPTIONS,
  httpOnly: true, // ← Keep secure
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// Update COOKIE_OPTIONS for clearCookie
const CLEAR_COOKIE_OPTIONS = {
  domain: 'localhost',
  sameSite: 'lax' as const,
  path: '/',
  // Don't specify httpOnly when clearing
};

@Controller('api/auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 attempts per minute
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    const result = await this.authService.register(registerDto);
    return {
      message:
        'Registration successful. Please check your email to verify your account.',
      ...result,
    };
  }

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 attempts per minute
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] ?? 'unknown';

    const result = await this.authService.login(loginDto, ipAddress, userAgent);

    if (result.requiresTwoFactor) {
      return {
        message: result.message,
        requiresTwoFactor: true,
        tempToken: result.tempToken,
      };
    } else {
      res.cookie('accessToken', result?.accessToken, {
        ...ACCESS_TOKEN_OPTIONS,
      });
      res.cookie('refreshToken', result?.refreshToken, {
        ...REFRESH_TOKEN_OPTIONS,
      });

      return {
        message: 'Login successful',
        user: result.user,
        tokens: {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        },
        redirect: '/dashboard',
      };
    }
  }

  @Post('refresh')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 attempts per minute
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } =
      await this.authService.refreshAccessToken(refreshTokenDto);

    res.cookie('accessToken', accessToken, ACCESS_TOKEN_OPTIONS);
    res.cookie('refreshToken', refreshToken, REFRESH_TOKEN_OPTIONS);

    return {
      message: 'Token refreshed successfully',
      accessToken,
      refreshToken,
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(refreshTokenDto.refreshToken);

    // Clear cookies with matching options
    res.clearCookie('accessToken', CLEAR_COOKIE_OPTIONS);
    res.clearCookie('refreshToken', CLEAR_COOKIE_OPTIONS);

    res.clearCookie('accessToken', {
      path: '/',
      sameSite: 'lax' as const,
    });
    res.clearCookie('refreshToken', {
      path: '/',
      sameSite: 'lax' as const,
    });

    return {
      message: 'Logout successful',
    };
  }

  @Get('profile')
  @UseGuards(JwtCookieAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getProfile(@Req() req: RequestWithUser) {
    return {
      message: 'Profile retrieved successfully',
      user: {
        ...req.user,
      },
    };
  }

  // Email Verification
  @Post('verify-email')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    await this.authService.verifyEmail(verifyEmailDto.token);
    return {
      message: 'Email verified successfully',
    };
  }

  @Post('resend-verification')
  @Throttle({ default: { limit: 3, ttl: 300000 } }) // 3 per 5 minutes
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async resendVerification(@Req() req: RequestWithUser) {
    await this.authService.resendVerificationEmail(req.user);
    return {
      message: 'Verification email sent',
    };
  }

  // Password Reset
  @Post('forgot-password')
  @Throttle({ default: { limit: 3, ttl: 300000 } }) // 3 per 5 minutes
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    await this.authService.forgotPassword(forgotPasswordDto.email);
    return {
      message:
        'If an account with that email exists, a password reset link has been sent',
    };
  }

  @Post('reset-password')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    await this.authService.resetPassword(resetPasswordDto);
    return {
      message: 'Password reset successfully',
    };
  }

  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Req() req: RequestWithUser,
    @Body() body: { oldPassword: string; newPassword: string },
  ) {
    await this.authService.changePassword(
      req.user.userId,
      body.oldPassword,
      body.newPassword,
    );
    return {
      message: 'Password changed successfully',
    };
  }

  // Two-Factor Authentication
  @Post('2fa/enable')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async enable2FA(@Req() req: RequestWithUser) {
    const result = await this.authService.enable2FA(req.user.userId);
    return {
      message: 'Scan this QR code with your authenticator app',
      ...result,
    };
  }

  @Post('2fa/verify')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async verify2FA(
    @Req() req: RequestWithUser,
    @Body() verify2FADto: Verify2FADto,
  ) {
    const backupCodes = await this.authService.verify2FASetup(verify2FADto);
    return {
      message:
        '2FA enabled successfully. Save these backup codes in a secure place.',
      backupCodes,
    };
  }

  @Post('2fa/disable')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async disable2FA(
    @Req() req: RequestWithUser,
    @Body() verify2FADto: Verify2FADto,
  ) {
    await this.authService.disable2FA(req.user.userId, verify2FADto.tempToken);
    return {
      message: '2FA disabled successfully',
    };
  }

  @Post('2fa/validate')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  async validate2FA(
    @Body() body: { email: string; token: string; tempToken: string },
  ) {
    const tokens = await this.authService.validate2FAToken(
      body.email,
      body.token,
      body.tempToken,
    );
    return {
      message: '2FA validation successful',
      ...tokens,
    };
  }

  // // OAuth Routes
  // @Get('google')
  // @UseGuards(GoogleAuthGuard)
  // async googleAuth() {
  //   // Guard redirects to Google
  // }

  // @Get('google/callback')
  // @UseGuards(GoogleAuthGuard)
  // async googleAuthCallback(@Req() req: RequestWithUser) {
  //   const tokens = await this.authService.handleOAuthLogin(req.user, 'google');
  //   // Redirect to frontend with tokens
  //   return {
  //     message: 'Google authentication successful',
  //     ...tokens,
  //   };
  // }

  // @Get('github')
  // @UseGuards(GithubAuthGuard)
  // async githubAuth() {
  //   // Guard redirects to GitHub
  // }

  // @Get('github/callback')
  // @UseGuards(GithubAuthGuard)
  // async githubAuthCallback(@Req() req: RequestWithUser) {
  //   const tokens = await this.authService.handleOAuthLogin(req.user, 'github');
  //   return {
  //     message: 'GitHub authentication successful',
  //     ...tokens,
  //   };
  // }

  // @Get('microsoft')
  // @UseGuards(MicrosoftAuthGuard)
  // async microsoftAuth() {
  //   // Guard redirects to Microsoft
  // }

  // @Get('microsoft/callback')
  // @UseGuards(MicrosoftAuthGuard)
  // async microsoftAuthCallback(@Req() req: RequestWithUser) {
  //   const tokens = await this.authService.handleOAuthLogin(
  //     req.user,
  //     'microsoft',
  //   );
  //   return {
  //     message: 'Microsoft authentication successful',
  //     ...tokens,
  //   };
  // }

  @Get('validate')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async validateToken() {
    return {
      message: 'Token is valid',
      valid: true,
    };
  }
}
