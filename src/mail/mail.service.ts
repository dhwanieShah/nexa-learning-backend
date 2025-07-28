import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendMail(emailData) {
    console.log('🚀 ~ MailService ~ sendMail ~ emailData:', {
      to: emailData.to,
      from: emailData.from,
      subject: emailData.subject,
      template: emailData.template,
      hasAttachments: !!emailData.attachments?.length,
      attachmentFilenames: emailData.attachments?.map((a) => a.filename) || [],
    });

    try {
      const result = await this.mailerService.sendMail(emailData);
      console.log('✅ Mail sent successfully');
      return result;
    } catch (error) {
      console.error('❌ Mail sending failed:', error);
      throw error;
    }
  }
}
