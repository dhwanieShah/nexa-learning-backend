import { Module, forwardRef } from '@nestjs/common';
import { CourseSectionController } from './courseSection.controller';
import { CourseSectionService } from './courseSection.service';
import { AuthModule } from 'src/auth/auth.module';
import { UploadFile } from 'helper/aws.helper';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseSection } from './entities/courseSection.entity';
import { CourseModule } from 'src/course/course.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([CourseSection]),
    AuthModule,
    forwardRef(() => CourseModule),
  ],
  controllers: [CourseSectionController],
  providers: [CourseSectionService, UploadFile],
  exports: [CourseSectionService],
})
export class CourseSectionModule {}
