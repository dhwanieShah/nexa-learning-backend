import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsArray, IsUUID } from 'class-validator';

export class AssignCourseToOrganizationDto {
  @ApiProperty({
    type: [String],
    description: 'UUIDs of assigned organizations',
  })
  @IsNotEmpty({ message: 'assignedTo must not be empty' })
  @IsArray()
  @IsUUID('4', {
    each: true,
    message: 'Please enter valid UUIDs for the assignedTo field',
  })
  readonly assignedTo: string[];
}
