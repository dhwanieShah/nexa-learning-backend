import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
} from 'class-validator';
import { Roles } from 'src/auth/entities/users.entity';

export class CreateRoleBaseUserDto {
  @ApiProperty({
    example: 'Alice',
    required: false,
    description: 'First name of the admin user',
  })
  @IsString()
  @IsOptional()
  readonly firstName: string;

  @ApiProperty({
    example: 'Smith',
    required: false,
    description: 'Last name of the admin user',
  })
  @IsOptional()
  readonly lastName: string;

  @ApiProperty({
    example: 'admin@example.com',
    required: false,
    description: 'Email address of the admin user',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Please enter correct email' })
  readonly email: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: false,
    description: 'Optional profile picture upload (image file)',
  })
  @IsOptional()
  readonly profilePic: any;

  @ApiProperty({
    example: 'securePassword123',
    minLength: 3,
    description: 'Password for the admin user',
  })
  @IsString()
  @MinLength(3)
  password: string;

  @ApiProperty({
    example: Roles.ADMIN,
    enum: Roles,
    description: 'Role must be "admin"',
  })
  @IsNotEmpty()
  @IsEnum([Roles.ADMIN], {
    message: 'Role must be from the "admin"',
  })
  readonly role: string;
}
