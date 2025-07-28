import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  readonly userId: string;

  @ApiProperty({ required: true, example: '123456' })
  @IsNotEmpty()
  readonly password: string;

  @ApiProperty({ required: true, example: '123456' })
  @IsNotEmpty()
  readonly confirmPassword: string;
}
