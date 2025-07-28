import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsNotEmpty, IsUUID } from 'class-validator';

export class AssigneByCourseDto {
  @IsInt()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @ApiProperty({ required: false })
  page?: number;

  @IsInt()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @ApiProperty({ required: false })
  limit?: number;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsUUID('4', { message: 'Invalid courseId UUID' })
  courseId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  search: string;
}
