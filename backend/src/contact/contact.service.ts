import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { NotificationsService } from '../notifications/notifications.service';
import { ConfigService } from '@nestjs/config';
import { createTransport, createTestAccount, getTestMessageUrl } from 'nodemailer';

@Injectable()
export class ContactService {
  constructor(
    private notificationsService: NotificationsService,
    private config: ConfigService,
  ) {}

  async submit(data: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }) {
    // Broadcast as notification to all admins
    await this.notificationsService.broadcast({
      type: 'CONTACT_MESSAGE',
      message: `📩 Message de ${data.name} (${data.email}): "${data.subject}"`,
    });

    const contactEmail = this.config.get<string>('CONTACT_EMAIL');
    const mailFrom = this.config.get<string>('MAIL_FROM') ?? 'Immo Lamis <no-reply@immolamis.com>';

    if (contactEmail) {
      await this.sendMail({
        to: contactEmail,
        subject: `Nouveau message de contact : ${data.subject}`,
        text: `Vous avez reçu un nouveau message de contact.

Nom : ${data.name}
Email : ${data.email}
Sujet : ${data.subject}

Message :
${data.message}
`,
      });
    }

    return {
      message:
        'Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.',
    };
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
