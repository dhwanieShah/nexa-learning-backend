import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber } from 'class-validator';

export class OrganizationUpdateDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  readonly name?: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  readonly image?: any;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  readonly address?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  readonly discription?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  readonly videoWatchLimit?: number;
}
