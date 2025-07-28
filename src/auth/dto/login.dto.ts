import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    required: true,
    example: 'nexa@mailinator.com',
    nullable: false,
  })
  @IsNotEmpty()
  @IsEmail({}, { message: 'Please enter correct email' })
  readonly email: string;

  @ApiProperty({ required: true, example: '123456' })
  @IsString()
  @MinLength(3)
  readonly password: string;
}
