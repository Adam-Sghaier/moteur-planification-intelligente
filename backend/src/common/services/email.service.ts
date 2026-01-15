import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }>;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    // Configure transporter (using ethereal for demo/testing)
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST') || 'smtp.ethereal.email',
      port: parseInt(this.configService.get('SMTP_PORT') || '587'),
      secure: false,
      auth: {
        user: this.configService.get('SMTP_USER') || '',
        pass: this.configService.get('SMTP_PASS') || '',
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; previewUrl?: string }> {
    try {
      const info = await this.transporter.sendMail({
        from: this.configService.get('SMTP_FROM') || '"Planification" <noreply@planification.fr>',
        to: options.to,
        subject: options.subject,
        html: options.html,
        attachments: options.attachments,
      });

      this.logger.log(`Email envoyé à ${options.to}: ${info.messageId}`);

      // For ethereal, get preview URL
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        this.logger.log(`Preview URL: ${previewUrl}`);
      }

      return {
        success: true,
        messageId: info.messageId,
        previewUrl: previewUrl || undefined,
      };
    } catch (error) {
      this.logger.error(`Erreur envoi email: ${error.message}`);
      throw error;
    }
  }

  async sendPlanningEmail(
    technicienEmail: string,
    technicienNom: string,
    affectations: Array<{
      tacheTitre: string;
      date: string;
      heureDebut: string;
      heureFin: string;
      localisation?: string;
    }>,
  ): Promise<{ success: boolean; messageId?: string; previewUrl?: string }> {
    const tableRows = affectations
      .map(
        (a) => `
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">${a.date}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${a.heureDebut} - ${a.heureFin}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${a.tacheTitre}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${a.localisation || '-'}</td>
        </tr>
      `,
      )
      .join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          table { border-collapse: collapse; width: 100%; margin-top: 20px; }
          th { background-color: #667eea; color: white; padding: 12px; text-align: left; }
          td { border: 1px solid #ddd; padding: 8px; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .footer { background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📅 Votre Planning</h1>
        </div>
        <div class="content">
          <p>Bonjour <strong>${technicienNom}</strong>,</p>
          <p>Voici votre planning d'interventions pour la semaine :</p>
          
          ${affectations.length > 0 ? `
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Horaires</th>
                  <th>Intervention</th>
                  <th>Lieu</th>
                </tr>
              </thead>
              <tbody>
                ${tableRows}
              </tbody>
            </table>
          ` : '<p><em>Aucune intervention planifiée pour cette semaine.</em></p>'}
        </div>
        <div class="footer">
          <p>Ce message a été généré automatiquement par le système de planification.</p>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: technicienEmail,
      subject: `📅 Votre planning - ${new Date().toLocaleDateString('fr-FR')}`,
      html,
    });
  }
}
