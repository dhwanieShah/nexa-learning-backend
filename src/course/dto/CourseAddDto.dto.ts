import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { LANGUAGE_CODE } from 'src/utils/constants';

export class CourseAddDto {
  @ApiProperty({
    example: 'Beginner Spanish Course',
    description: 'Title of the course',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  readonly title: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: false,
    description: 'Optional image file for the course thumbnail',
  })
  @IsOptional()
  image: any;

  @ApiProperty({
    example: 'This course introduces basic Spanish vocabulary.',
    description: 'Detailed course description',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  readonly description: string;

  @ApiProperty({
    example: 'Ensure learners complete Module 1 before proceeding.',
    description: 'Internal or learner-facing note for the course',
    required: false,
  })
  @IsString()
  @IsOptional()
  readonly note: string;

  @ApiProperty({
    example: LANGUAGE_CODE.EN,
    description: 'Language code of the course (e.g., "en", "fr", "de")',
    required: false,
    default: LANGUAGE_CODE.EN,
  })
  @IsString()
  @IsOptional()
  readonly languageCode: string;

  @ApiProperty({
    example: '6bdf35f9-0154-4f65-9b2a-781b1846b83d',
    description: 'UUID of the base English course (only for non-English)',
    required: false,
  })
  @IsOptional()
  readonly baseCourseId?: string;
}
