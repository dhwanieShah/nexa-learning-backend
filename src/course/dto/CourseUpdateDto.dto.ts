import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { LANGUAGE_CODE } from 'src/utils/constants';

export class CourseUpdateDto {
  @ApiProperty({
    example: 'Advanced German Course',
    required: false,
    description: 'Updated title of the course',
  })
  @IsOptional()
  @IsString()
  readonly title: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: false,
    description: 'Optional updated course image (file upload)',
  })
  @IsOptional()
  image: any;

  @ApiProperty({
    example: 'Covers advanced grammar and fluency in German.',
    required: false,
    description: 'Updated course description',
  })
  @IsOptional()
  @IsString()
  readonly description: string;

  @ApiProperty({
    example: 'This course requires prior knowledge of basic German.',
    required: false,
    description: 'Updated internal or learner-facing note for the course',
  })
  @IsOptional()
  @IsString()
  readonly note: string;

  @ApiProperty({
    example: LANGUAGE_CODE.EN,
    required: false,
    default: LANGUAGE_CODE.EN,
    description: 'Language code for the course (e.g., "en", "de", "fr")',
  })
  @IsOptional()
  @IsString()
  readonly languageCode: string;
}
