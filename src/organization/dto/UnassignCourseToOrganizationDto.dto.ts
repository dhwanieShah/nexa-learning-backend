import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class UnassignCourseToOrganizationDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID('4', {
    message: 'Please enter a valid UUID for the course',
  })
  readonly courses?: string;
}
