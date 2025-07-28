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
    example: 'Smith',
    required: false,
    description: 'Last name of the user',
  })
  @IsString()
  @IsOptional()
  readonly lastName: string;

  @ApiProperty({
    example: 'Alice Smith',
    required: false,
    description: 'Full display name of the user',
  })
  @IsString()
  @IsOptional()
  readonly name: string;

  @ApiProperty({
    example: 'New York',
    required: false,
    description: 'Current location of the user',
  })
  @IsString()
  @IsOptional()
  readonly location: string;
}
