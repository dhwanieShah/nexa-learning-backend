import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, IsBoolean } from 'class-validator';
import { LANGUAGE_CODE } from 'src/utils/constants';

export class PaginatedQueryDto {
  @ApiProperty({
    example: 1,
    required: false,
    description: 'Current page number for pagination (starts from 1)',
    default: 1,
  })
  @IsInt()
  @IsOptional()
  @Transform(({ value }) => value && parseInt(value))
  page?: number;

  @ApiProperty({
    example: 10,
    required: false,
    description: 'Number of items per page',
    default: 10,
  })
  @IsInt()
  @IsOptional()
  @Transform(({ value }) => value && parseInt(value))
  limit?: number;

  @ApiProperty({
    example: 'basic spanish',
    required: false,
    description: 'Search keyword for title or description',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    example: 'b8f5f9a6-ceda-4a58-a30a-34e8751c7a0f',
    required: false,
    description: 'Optional organization ID to filter courses or users',
  })
  @IsOptional()
  @IsString()
  organizationId?: string;

  @ApiProperty({
    example: LANGUAGE_CODE.EN,
    required: false,
    description: 'Language code for filtering content (e.g., "en", "fr")',
    default: LANGUAGE_CODE.EN,
  })
  @IsOptional()
  @IsString()
  readonly languageCode?: string;

  @ApiProperty({
    example: true,
    required: false,
    description: 'Enable/disable pagination (true = paginated, false = all)',
    default: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'boolean') return value;
    return value === 'true';
  })
  @IsBoolean()
  readonly pagination?: boolean;
}
