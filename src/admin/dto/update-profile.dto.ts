import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
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
}
