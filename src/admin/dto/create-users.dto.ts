import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Roles } from 'src/auth/entities/users.entity';

export class CreateUserDto {
  @ApiProperty({ example: 'John', description: 'First name of the user' })
  @IsNotEmpty()
  @IsString()
  readonly firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Last name of the user' })
  @IsNotEmpty()
  readonly lastName: string;

  @ApiProperty({
    example: 'temp@mailinator.com',
    description: 'Valid email address of the user',
  })
  @IsNotEmpty()
  @IsEmail({}, { message: 'Please enter correct email' })
  readonly email: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: false,
    description: 'Optional profile picture upload (image file)',
  })
  readonly profilePic: any;

  @ApiProperty({
    example: Roles.TRAINER,
    enum: [Roles.TRAINER, Roles.LEARNER],
    description: 'Role must be either "trainer" or "learner"',
  })
  @IsNotEmpty()
  @IsEnum([Roles.TRAINER, Roles.LEARNER], {
    message: 'Role must be from the "trainer" or "learner"',
  })
  readonly role: string;

  @ApiProperty({
    example: 'Product Manager',
    required: false,
    description: 'Job position of the user',
  })
  readonly position: string;

  @ApiProperty({
    example: 'en',
    description: 'Language code (e.g., "en", "de", "fr")',
  })
  @ApiProperty({ required: false, description: 'Organization ID (UUID)' })
  @IsOptional()
  @IsString()
  readonly organization: string;
}
