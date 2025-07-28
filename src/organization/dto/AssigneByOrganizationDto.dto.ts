import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsNotEmpty,
  IsUUID,
  IsString,
} from 'class-validator';

export class AssigneByOrganizationDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  page?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  limit?: number;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsUUID('4', { message: 'Please enter a valid UUID for courseId' })
  courseId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;
}
