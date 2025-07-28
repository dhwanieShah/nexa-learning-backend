import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    example: 'Alice',
    required: false,
    description: 'First name of the user',
  })
  @IsString()
  @IsOptional()
  readonly firstName: string;

  @ApiProperty({
    example: 'Johnson',
    required: false,
    description: 'Last name of the user',
  })
  @IsString()
  @IsOptional()
  readonly lastName: string;

  @ApiProperty({
    example: 'Alice Johnson',
    required: false,
    description: 'Full display name of the user',
  })
  @IsString()
  @IsOptional()
  readonly name: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: false,
    description: 'Profile picture upload (image file)',
  })
  @IsOptional()
  readonly profilePic: any;

  @ApiProperty({
    example: 'Team Lead',
    required: false,
    description: 'Job position of the user',
  })
  @IsString()
  @IsOptional()
  readonly position: string;

  @ApiProperty({ required: false })
  readonly organization: string;
}
