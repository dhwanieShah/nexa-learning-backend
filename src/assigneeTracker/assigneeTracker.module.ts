import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssigneeTrackerController } from './assigneeTracker.controller';
import { AssigneeTrackerService } from './assigneeTracker.service';
import { AuthModule } from 'src/auth/auth.module';
import { AssigneeTracker } from './entities/assigneeTracker.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AssigneeTracker]), AuthModule],
  controllers: [AssigneeTrackerController],
  providers: [AssigneeTrackerService],
  exports: [AssigneeTrackerService],
})
export class AssigneeTrackerModule {}
