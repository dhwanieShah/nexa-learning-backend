import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseController } from './course.controller';
import { CourseService } from './course.service';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { UploadFile } from 'helper/aws.helper';
import { Course } from './entities/course.entity';
import { AssigneeTrackerModule } from 'src/assigneeTracker/assigneeTracker.module';
import { CourseSectionModule } from 'src/courseSection/courseSection.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([Course]),
    AuthModule,
    forwardRef(() => UsersModule),
    AssigneeTrackerModule,
    CourseSectionModule,
  ],
  controllers: [CourseController],
  providers: [CourseService, UploadFile],
  exports: [CourseService],
})
export class CourseModule {}
