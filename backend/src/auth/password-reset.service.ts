/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/consistent-type-assertions */
/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { createTransport, createTestAccount, getTestMessageUrl } from 'nodemailer';
import { AccountStatus, UserType } from '@prisma/client';
import * as crypto from 'crypto';

type UserKind = 'ADMIN' | 'PROVIDER';

type PasswordResetTokenDelegate = {
  create: (args: { data: any }) => Promise<any>;
  findMany: (args: any) => Promise<Array<any>>;
  update: (args: any) => Promise<any>;
};

@Injectable()
export class PasswordResetService {
  private readonly tokenTtlMs: number;
  private readonly passwordResetTokenDelegate: PasswordResetTokenDelegate;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    const ttl = this.config.get<string>('PASSWORD_RESET_EXPIRES_IN') ?? '30m';
    this.tokenTtlMs = this.parseDurationToMs(ttl);

    this.passwordResetTokenDelegate = (this.prisma as unknown as {
      passwordResetToken: PasswordResetTokenDelegate;
    }).passwordResetToken;
  }

  async forgot(dto: ForgotPasswordDto) {
    const { email, userType } = dto;

    const user =
      userType === 'ADMIN'
        ? await this.prisma.admin.findUnique({ where: { email } })
        : await this.prisma.provider.findUnique({ where: { email } });

    if (!user) {
      return {
        message:
          'Si votre compte existe, un email de réinitialisation a été envoyé.',
      };
    }

    if (userType === 'ADMIN') {
      const adminStatus = (user as { status: AccountStatus }).status;
      if (adminStatus === 'SUSPENDED') {
        throw new UnauthorizedException(
          'Votre compte administrateur a été suspendu.',
        );
      }
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = await bcrypt.hash(rawToken, 10);
    const expiresAt = new Date(Date.now() + this.tokenTtlMs);

    await this.passwordResetTokenDelegate.create({
      data: {
        userType: userType as UserType,
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    const frontendUrl = this.config.getOrThrow<string>('FRONTEND_URL');
    const resetBase = `${frontendUrl.replace(/\/$/, '')}/reset-password`;
    const resetUrl =
      `${resetBase}?token=${encodeURIComponent(rawToken)}` +
      `&userType=${encodeURIComponent(userType)}`;

    const nodeEnv = this.config.get<string>('NODE_ENV', 'development');
    const smtpHost = this.config.get<string>('SMTP_HOST');
    const smtpPort = this.config.get<string>('SMTP_PORT');
    const smtpUser = this.config.get<string>('SMTP_USER');
    const smtpPass = this.config.get<string>('SMTP_PASS');
    const mailFrom = this.config.get<string>('MAIL_FROM');

    const smtpConfigured = Boolean(
      smtpHost && smtpPort && smtpUser && smtpPass && mailFrom,
    );

    if (!smtpConfigured) {
      console.warn('SMTP non configuré. Lien de réinitialisation :', resetUrl);
    }

    const previewUrl = await this.sendMail({
      to: email,
      subject: 'Réinitialisation de votre mot de passe',
      text: `Bonjour,

Cliquez sur le lien pour réinitialiser votre mot de passe :
${resetUrl}

Ce lien expire bientôt.

Cordialement,
Immo Lamis`,
    });

    const response: { message: string; resetUrl?: string; previewUrl?: string } = {
      message:
        'Si votre compte existe, un email de réinitialisation a été envoyé.',
    };

    if (nodeEnv !== 'production' && !smtpConfigured) {
      response.resetUrl = resetUrl;
      if (previewUrl) response.previewUrl = previewUrl;
    }

    return response;
  }

  async sendTestEmail(to: string) {
    const smtpHost = this.config.get<string>('SMTP_HOST');
    const smtpPort = Number(this.config.get<string>('SMTP_PORT'));
    const smtpUser = this.config.get<string>('SMTP_USER');
    const smtpPass = this.config.get<string>('SMTP_PASS');
    const mailFrom = this.config.get<string>('MAIL_FROM');

    if (!smtpHost || !smtpPort || !smtpUser || !smtpPass || !mailFrom) {
      throw new InternalServerErrorException(
        'SMTP non configuré. Vérifiez les variables SMTP dans .env.',
      );
    }

    await this.sendMail({
      to,
      subject: 'Test SMTP - Envoi d’email',
      text: 'Ceci est un email de test pour vérifier la configuration SMTP.',
    });

    return { message: 'Email de test envoyé avec succès.' };
  }

  async reset(dto: ResetPasswordDto) {
    const { token, newPassword, userType } = dto;
    const kind = userType as UserKind;

    const tokens = await this.passwordResetTokenDelegate.findMany({
      where: {
        userType: userType as UserType,
        expiresAt: { gt: new Date() },
        usedAt: null,
      },
      take: 10,
      orderBy: { createdAt: 'desc' },
    });

    let matched:
      | { id: number; userId: number; tokenHash: string }
      | null = null;

    for (const t of tokens) {
      const ok = await bcrypt.compare(token, t.tokenHash);
      if (ok) {
        matched = { id: t.id, userId: t.userId, tokenHash: t.tokenHash };
        break;
      }
    }

    if (!matched) {
      throw new BadRequestException(
        'Lien de réinitialisation invalide ou expiré.',
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    if (kind === 'ADMIN') {
      const admin = await this.prisma.admin.findUnique({
        where: { id: matched.userId },
      });

      if (!admin) throw new NotFoundException('Compte introuvable.');

      if (admin.isSuperAdmin) {
        throw new BadRequestException(
          'Impossible de réinitialiser le Super Admin.',
        );
      }

      await this.prisma.admin.update({
        where: { id: matched.userId },
        data: { password: hashedPassword },
      });
    } else {
      const provider = await this.prisma.provider.findUnique({
        where: { id: matched.userId },
      });

      if (!provider) throw new NotFoundException('Compte introuvable.');

      await this.prisma.provider.update({
        where: { id: matched.userId },
        data: { password: hashedPassword },
      });
    }

    await this.passwordResetTokenDelegate.update({
      where: { id: matched.id },
      data: { usedAt: new Date() },
    });

    return { message: 'Mot de passe réinitialisé avec succès.' };
  }

  private parseDurationToMs(input: string) {
    const match = /^(\d+)(m|h|d)$/.exec(input.trim());
    if (!match) return 30 * 60 * 1000;

    const value = parseInt(match[1], 10);
    const unit = match[2];

    if (unit === 'm') return value * 60 * 1000;
    if (unit === 'h') return value * 60 * 60 * 1000;
    if (unit === 'd') return value * 24 * 60 * 60 * 1000;
    return value * 60 * 1000;
  }

  private async sendMail(data: { to: string; subject: string; text: string }) {
    const smtpHost = this.config.get<string>('SMTP_HOST');
    const smtpPort = Number(this.config.get<string>('SMTP_PORT'));
    const smtpUser = this.config.get<string>('SMTP_USER');
    const smtpPass = this.config.get<string>('SMTP_PASS');
    const mailFrom = this.config.get<string>('MAIL_FROM') ?? 'Immo Lamis <no-reply@immolamis.com>';
    const nodeEnv = this.config.get<string>('NODE_ENV', 'development');

    let transport;
    let previewUrl: string | null = null;

    if (!smtpHost || !smtpPort || !smtpUser || !smtpPass || !mailFrom) {
      if (nodeEnv === 'production') {
        throw new InternalServerErrorException(
          'SMTP non configuré pour l’envoi d’email.',
        );
      }

      const testAccount = await createTestAccount();

      transport = createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    } else {
      transport = createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
    }

    try {
      const info = await transport.sendMail({
        from: mailFrom,
        to: data.to,
        subject: data.subject,
        text: data.text,
      });

      if (!smtpHost || !smtpPort || !smtpUser || !smtpPass || !mailFrom) {
        const testUrl = getTestMessageUrl(info);
        previewUrl = typeof testUrl === 'string' ? testUrl : null;
        console.warn('Email d’essai envoyé via Ethereal, preview URL:', previewUrl);
      }

      return previewUrl;
    } catch (error) {
      console.error('Email send error:', error);
      throw new InternalServerErrorException(
        'Envoi email impossible. Vérifiez la configuration SMTP.',
      );
    }
  }
}
