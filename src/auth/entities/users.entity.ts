import { Organization } from 'src/organization/entities/organization.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

export enum Roles {
  ADMIN = 'admin',
  TRAINER = 'trainer',
  LEARNER = 'learner',
}

export enum Status {
  VERIFIED = 'verified',
  PENDING = 'pending',
  DEACTIVATED = 'deactivated',
  BLOCKED = 'blocked',
  REJECTED = 'rejected',
}

export enum LoginType {
  NORMAL = 'normal',
  APPLE = 'apple',
  FACEBOOK = 'facebook',
  GOOGLE = 'google',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  name: string;

  @Column({ default: '' })
  profilePic: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column({ type: 'enum', enum: Roles, nullable: true })
  role: Roles;

  @Column({ nullable: true })
  otp: number;

  @Column({ type: 'enum', enum: Status, nullable: true })
  status: Status;

  @Column({ nullable: true })
  position: string;

  @Column({ nullable: true })
  fcmToken: string;

  @Column({ nullable: true })
  deviceType: string;

  @Column({ nullable: true })
  deviceId: string;

  @Column({ nullable: true })
  deviceName: string;

  @Column({ type: 'timestamp', nullable: true })
  loginTime: Date;

  @Column({ nullable: true })
  googleId: string;

  @Column({ nullable: true })
  appleId: string;

  @Column({ nullable: true })
  facebookId: string;

  @Column({ type: 'enum', enum: LoginType, default: LoginType.NORMAL })
  loginType: LoginType;

  @Column({ default: true })
  isFirstTimeLogin: boolean;

  @Column({ type: 'timestamp', nullable: true })
  logoutTime: Date;

  @Column({ default: false })
  deleted: boolean;

  @ManyToOne(() => Organization, { nullable: true })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
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

  @Column({ default: '' })
  location: string;
}
