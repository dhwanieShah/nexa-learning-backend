import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadFile } from 'helper/aws.helper';
import { AuthModule } from 'src/auth/auth.module';
import { CourseModule } from 'src/course/course.module';
import { UsersModule } from 'src/users/users.module';
import { OrganizationController } from './organization.controller';
import { OrganizationService } from './organization.service';
import { Organization } from './entities/organization.entity';
import { AssigneeTrackerModule } from 'src/assigneeTracker/assigneeTracker.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Organization]),
    AuthModule,
    forwardRef(() => UsersModule),
    forwardRef(() => CourseModule),
    AssigneeTrackerModule,
  ],
  controllers: [OrganizationController],
  providers: [OrganizationService, UploadFile],
  exports: [OrganizationService, TypeOrmModule.forFeature([Organization])],
})
export class OrganizationModule {}
