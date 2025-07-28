import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AuthModule } from 'src/auth/auth.module';
import { MailModule } from 'src/mail/mail.module';
import { UploadFile } from 'helper/aws.helper';
import { User } from 'src/auth/entities/users.entity';
import { OrganizationModule } from 'src/organization/organization.module';
import { AssigneeTrackerModule } from 'src/assigneeTracker/assigneeTracker.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]), // ✅ TypeORM entity
    AuthModule,
    MailModule,
    OrganizationModule,
    AssigneeTrackerModule,
  ],
  controllers: [AdminController],
  providers: [AdminService, UploadFile],
  exports: [AdminService],
})
export class AdminModule {}
