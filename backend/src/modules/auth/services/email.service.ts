import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST'),
      port: this.configService.get('SMTP_PORT'),
      secure: this.configService.get('SMTP_SECURE') === 'true',
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
      logger: true,
      debug: true,
    });
  }

  async sendVerificationEmail(
    email: string,
    token: string,
    name: string,
  ): Promise<void> {
    const verificationUrl = `${this.configService.get('FRONTEND_URL')}/verify-email?token=${token}`;

    const mailOptions = {
      from: `"${this.configService.get('APP_NAME')}" <${this.configService.get('SMTP_FROM')}>`,
      to: email,
      subject: 'Verify Your Email Address',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .button { 
                display: inline-block; 
                padding: 12px 24px; 
                background-color: #4CAF50; 
                color: white; 
                text-decoration: none; 
                border-radius: 4px;
                margin: 20px 0;
              }
              .footer { margin-top: 30px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>Welcome to ${this.configService.get('APP_NAME')}, ${name}!</h2>
              <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
              <p>Or copy and paste this link into your browser:</p>
              <p>${verificationUrl}</p>
              <p>This link will expire in 24 hours.</p>
              <div class="footer">
                <p>If you didn't create this account, please ignore this email.</p>
                <p>&copy; ${new Date().getFullYear()} ${this.configService.get('APP_NAME')}. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      this.logger.log('SENDMAIL RESULT:', result);

      this.logger.log(`Verification email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${email}`, error);
      throw error;
    }
  }

  async sendPasswordResetEmail(
    email: string,
    token: string,
    name: string,
  ): Promise<void> {
    const resetUrl = `${this.configService.get('FRONTEND_URL')}/reset-password?token=${token}`;

    const mailOptions = {
      from: `"${this.configService.get('APP_NAME')}" <${this.configService.get('SMTP_FROM')}>`,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .button { 
                display: inline-block; 
                padding: 12px 24px; 
                background-color: #f44336; 
                color: white; 
                text-decoration: none; 
                border-radius: 4px;
                margin: 20px 0;
              }
              .warning { 
                background-color: #fff3cd; 
                padding: 15px; 
                border-left: 4px solid #ffc107;
                margin: 20px 0;
              }
              .footer { margin-top: 30px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>Password Reset Request</h2>
              <p>Hi ${name},</p>
              <p>We received a request to reset your password. Click the button below to create a new password:</p>
              <a href="${resetUrl}" class="button">Reset Password</a>
              <p>Or copy and paste this link into your browser:</p>
              <p>${resetUrl}</p>
              <div class="warning">
                <strong>Security Notice:</strong> This link will expire in 15 minutes for security reasons.
              </div>
              <div class="footer">
                <p><strong>If you didn't request a password reset, please ignore this email and your password will remain unchanged.</strong></p>
                <p>For security reasons, we recommend changing your password if you didn't make this request.</p>
                <p>&copy; ${new Date().getFullYear()} ${this.configService.get('APP_NAME')}. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Password reset email sent to ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send password reset email to ${email}`,
        error,
      );
      throw error;
    }
  }

  async sendPasswordChangedNotification(
    email: string,
    name: string,
  ): Promise<void> {
    const mailOptions = {
      from: `"${this.configService.get('APP_NAME')}" <${this.configService.get('SMTP_FROM')}>`,
      to: email,
      subject: 'Your Password Has Been Changed',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .alert { 
                background-color: #d4edda; 
                padding: 15px; 
                border-left: 4px solid #28a745;
                margin: 20px 0;
              }
              .footer { margin-top: 30px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>Password Changed Successfully</h2>
              <p>Hi ${name},</p>
              <div class="alert">
                <strong>✓ Success:</strong> Your password has been changed successfully.
              </div>
              <p>If you made this change, you can safely ignore this email.</p>
              <p><strong>If you didn't make this change, please contact our support team immediately.</strong></p>
              <div class="footer">
                <p>This is an automated notification. Please do not reply to this email.</p>
                <p>&copy; ${new Date().getFullYear()} ${this.configService.get('APP_NAME')}. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Password changed notification sent to ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send password changed notification to ${email}`,
        error,
      );
      throw error;
    }
  }

  async send2FACode(email: string, code: string, name: string): Promise<void> {
    const mailOptions = {
      from: `"${this.configService.get('APP_NAME')}" <${this.configService.get('SMTP_FROM')}>`,
      to: email,
      subject: 'Your Two-Factor Authentication Code',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .code { 
                font-size: 32px; 
                font-weight: bold; 
                letter-spacing: 8px;
                background-color: #f5f5f5;
                padding: 20px;
                text-align: center;
                border-radius: 4px;
                margin: 20px 0;
              }
              .warning { 
                background-color: #fff3cd; 
                padding: 15px; 
                border-left: 4px solid #ffc107;
                margin: 20px 0;
              }
              .footer { margin-top: 30px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>Two-Factor Authentication</h2>
              <p>Hi ${name},</p>
              <p>Your two-factor authentication code is:</p>
              <div class="code">${code}</div>
              <div class="warning">
                <strong>Security Notice:</strong> This code will expire in 5 minutes.
              </div>
              <p>If you didn't request this code, please ignore this email and secure your account.</p>
              <div class="footer">
                <p>Never share this code with anyone. Our team will never ask for this code.</p>
                <p>&copy; ${new Date().getFullYear()} ${this.configService.get('APP_NAME')}. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`2FA code sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send 2FA code to ${email}`, error);
      throw error;
    }
  }
}
