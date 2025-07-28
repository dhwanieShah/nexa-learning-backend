import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CourseSectionUpdateDto {
  @ApiProperty({
    description: 'Title of the section',
    example: 'Introduction to Variables',
  })
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  readonly title: string;

  @ApiProperty({
    description: 'UUID of the course this section belongs to',
    example: 'a2f3c8e0-4f50-4d11-b7c9-72c473f74e3e',
    required: true,
  })
  @IsNotEmpty()
  @IsUUID('4', { message: 'Please enter a valid UUID for the course' })
  readonly course: string;

  @ApiProperty({
    description: 'UUID of the base course this section belongs to',
    example: 'a2f3c8e0-4f50-4d11-b7c9-72c473f74e3e',
    required: true,
  })
  @IsNotEmpty()
  @IsUUID('4', { message: 'Please enter a valid UUID for the base course' })
  readonly baseCourse: string;
}
