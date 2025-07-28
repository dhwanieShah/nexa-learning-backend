import { ApiProperty } from '@nestjs/swagger';

export class emailVerificationDto {
  @ApiProperty()
  readonly userId: string;

  @ApiProperty()
  readonly otp: number;
}
