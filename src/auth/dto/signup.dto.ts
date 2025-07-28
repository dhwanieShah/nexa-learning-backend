import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';
import { Roles } from '../entities/users.entity';

export class SignUpDto {
  @ApiProperty({ required: true, example: 'Alice' })
  @IsNotEmpty()
  @IsString()
  readonly firstName: string;

  @ApiProperty({ required: true, example: 'Smith' })
  @IsNotEmpty()
  readonly lastName: string;

  @ApiProperty({ required: true, example: 't4mWp@example.com' })
  @IsNotEmpty()
  @IsEmail({}, { message: 'Please enter correct email' })
  readonly email: string;

  @ApiProperty({ required: true, example: '123456' })
  @IsString()
  @MinLength(3)
  password: string;

  @ApiProperty({
    example: Roles.TRAINER,
    enum: Roles,
    description: 'Role must be either "trainer" or "learner"',
  })
  @IsNotEmpty()
  @IsEnum([Roles.TRAINER, Roles.LEARNER], {
    message: 'Role must be either "trainer" or "learner"',
  })
  readonly role: Roles;
}
