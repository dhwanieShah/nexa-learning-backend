import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class UnassignCourseDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID('4', {
    message: 'Please enter a valid UUID for the course',
  })
  readonly courseId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID('4', {
    message: 'Please enter a valid UUID for the organization',
  })
  readonly organizationId: string;
}
