import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsArray, IsUUID, IsNotEmpty } from 'class-validator';

export class AssignCourseDto {
  @ApiProperty({ type: [String] })
  @IsNotEmpty({ message: 'assignedTo must not be empty' })
  @IsArray()
  @IsUUID('4', {
    each: true,
    message: 'Please enter valid UUIDs for the users',
  })
  readonly assignedTo: string[];
}
