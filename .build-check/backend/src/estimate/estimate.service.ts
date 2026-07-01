import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { NotificationsService } from '../notifications/notifications.service';
import { ConfigService } from '@nestjs/config';
import { createTransport, createTestAccount, getTestMessageUrl } from 'nodemailer';

@Injectable()
export class EstimateService {
  constructor(
    private notificationsService: NotificationsService,
    private config: ConfigService,
  ) {}

  async submit(data: {
    firstName: string;
    lastName: string;
    address: string;
    postalCode: string;
    city: string;
    phone: string;
    email: string;
    propertyType: string;
    propertyAddress: string;
    rooms?: number;
    livingArea: number;
    landArea?: number;
    facades?: string;
    floor?: string;
    hasElevator?: boolean;
    hasPapers?: string;
    message?: string;
  }) {
    const propertyTypeLabels: Record<string, string> = {
      apartment: 'Appartement',
      house: 'Maison',
      land: 'Terrain',
    };
    const propertyType =
      propertyTypeLabels[data.propertyType] || data.propertyType || 'Non spécifié';

    const paperLabels: Record<string, string> = {
      tous: 'Acte Notarié + Livret Foncier',
      acte_seul: 'Acte Notarié uniquement',
      livret_seul: 'Livret Foncier uniquement',
      aucun: 'En cours de régularisation / Aucun',
    };
    const papers = data.hasPapers
      ? paperLabels[data.hasPapers] || data.hasPapers
      : 'Non spécifié';

    await this.notificationsService.broadcast({
      type: 'CONTACT_MESSAGE',
      message: `🏠 Demande d'estimation de ${data.firstName} ${data.lastName} (${data.email}): ${propertyType}`,
    });

    const contactEmail = this.config.get<string>('CONTACT_EMAIL') ?? 'immolamis@gmail.com';

    const emailContent = `Vous avez reçu une nouvelle demande d'estimation immobilière.

========== INFORMATIONS PERSONNELLES ==========
Nom : ${data.firstName} ${data.lastName}
Adresse : ${data.address}, ${data.postalCode} ${data.city}
Téléphone : ${data.phone}
Email : ${data.email}

========== DÉTAILS DU BIEN ==========
Type de bien : ${propertyType}
Adresse du bien : ${data.propertyAddress}
Nombre de pièces : ${data.rooms || 'Non spécifié'}
Superficie habitable : ${data.livingArea} m²
Superficie terrain : ${data.landArea || 'Non spécifié'} m²
Façades : ${data.facades || 'Non spécifié'}
Étage : ${data.floor || 'Non spécifié'}
Ascenseur : ${data.hasElevator ? 'Oui' : 'Non'}
Situation juridique : ${papers}

========== INFORMATIONS SUPPLÉMENTAIRES ==========
${data.message || 'Aucun message supplémentaire'}

========== INSTRUCTIONS ==========
Pour répondre au client, répondez à cet email.
`;

    if (contactEmail) {
      await this.sendMail({
        to: contactEmail,
        subject: `📋 Nouvelle demande d'estimation : ${propertyType} à ${data.city}`,
        text: emailContent,
      });
    }

    const clientEmailContent = `Bonjour ${data.firstName},

Merci pour votre demande d'estimation ! 🏡

Nous avons bien reçu vos informations :
- Bien : ${propertyType}
- Superficie : ${data.livingArea} m²
- Localisation : ${data.city}

Notre équipe d'experts va analyser votre bien et vous contactera dans les 24 heures au numéro ${data.phone} ou par email pour vous proposer une estimation gratuite et sans engagement.

Cordialement,
L'équipe Immo Lamis
`;

    await this.sendMail({
      to: data.email,
      subject: 'Confirmation de votre demande d\'estimation - Immo Lamis',
      text: clientEmailContent,
    });

    return {
      message:
        'Votre demande d\'estimation a été envoyée avec succès. Nous vous recontacterons dans les 24 heures.',
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
          "SMTP non configuré pour l'envoi d'email.",
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
        console.warn("Email d'essai envoyé via Ethereal, preview URL:", previewUrl);
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
