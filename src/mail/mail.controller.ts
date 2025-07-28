import { Body, Controller, Post } from '@nestjs/common';
import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('send')
  async sendMail(@Body() body: any) {
    try {
      const result = await this.mailService.sendMail({});

      return result;
    } catch (error) {
      return error;
    }
  }
}
