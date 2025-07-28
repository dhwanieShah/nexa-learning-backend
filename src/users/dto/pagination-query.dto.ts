import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

export class PaginatedQueryDto {
  @IsInt()
  @IsOptional()
  @Transform(({ value }) => value && parseInt(value))
  @ApiProperty({ required: false })
  page?: number;

  @IsInt()
  @IsOptional()
  @Transform(({ value }) => value && parseInt(value))
  @ApiProperty({ required: false })
  limit?: number;

  @ApiProperty({ description: '"trainer" or "learner"', required: false })
  @IsOptional()
  role: string;

  @ApiProperty({
    description: 'Search by firstName, lastName or name',
    required: false,
  })
  @IsOptional()
  search: string;
}
