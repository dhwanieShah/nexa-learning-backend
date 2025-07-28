import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ForgotPasswordVerificationDto {
  @ApiProperty({
    required: true,
    example: '67189e6a-7e5d-4a9b-8191-fee546232478',
  })
  @IsNotEmpty()
  readonly userId: string;

  @ApiProperty({ required: true, example: '123456' })
  @IsNotEmpty()
  readonly otp: number;
}
