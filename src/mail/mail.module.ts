import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: 'smtp.ionos.fr',
        port: 465,
        secure: true,
        auth: {
          user: 'dev@pixeogroup.com',
          pass: 'gBDcF4Ku+.j5V!J',
        },
      },
      defaults: {
        from: 'dev@pixeogroup.com',
      },
      template: {
        dir: join(__dirname, '../../../view/mail-template'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  ],
  controllers: [MailController],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
