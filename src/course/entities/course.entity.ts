import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { User } from 'src/auth/entities/users.entity';
import { LANGUAGE_CODE } from 'src/utils/constants';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'text', nullable: true })
  image?: string;

  @Column({ type: 'text' })
  description: string;

  @ManyToOne(() => Course, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'baseCourseId' })
  baseCourse: Course;

  @Column({ type: 'boolean', default: false })
  deleted: boolean;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt?: Date;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'createdBy' })
  createdBy: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updatedBy' })
  updatedBy: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'deletedBy' })
  deletedBy: User;

  @Column({ type: 'boolean', default: false })
  isLearning: boolean;

  @Column({ type: 'float', default: 0 })
  completedPercentage: number;

  @Column({ type: 'text', nullable: true })
  note?: string;

  @Column({ type: 'text', default: LANGUAGE_CODE.EN })
  languageCode: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
