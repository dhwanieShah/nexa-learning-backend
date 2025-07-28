import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  JoinColumn,
} from 'typeorm';
import { Course } from 'src/course/entities/course.entity';
import { Organization } from 'src/organization/entities/organization.entity';
import { User } from 'src/auth/entities/users.entity';

@Entity('assigneeTracker')
export class AssigneeTracker {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Course, { nullable: false })
  @JoinColumn({ name: 'course' })
  course: Course;

  @ManyToOne(() => Organization, { nullable: false })
  @JoinColumn({ name: 'organization' })
  organization: Organization;

  @Column({ default: false })
  deleted: boolean;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'createdBy' })
  createdBy: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updatedBy' })
  updatedBy: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'deletedBy' })
  deletedBy: User;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
