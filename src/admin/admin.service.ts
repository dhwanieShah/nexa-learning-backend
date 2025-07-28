import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as moment from 'moment';
import { ROLES, STATUS } from 'src/utils/constants';
import { User, Status } from '../auth/entities/users.entity';
import { Organization } from '../organization/entities/organization.entity';
import { AssigneeTrackerService } from 'src/assigneeTracker/assigneeTracker.service';
import { OrganizationService } from 'src/organization/organization.service';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Organization) private orgRepo: Repository<Organization>,
    private assigneeTrackerService: AssigneeTrackerService,
    private organizationServices: OrganizationService,
  ) {}

  async findAllUsers(query: any) {
    const page = query.page ? parseInt(query.page) : 1;
    const limit = query.limit ? parseInt(query.limit) : 10;
    const skip = (page - 1) * limit;

    const qb = this.userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.organization', 'organization')
      .where('user.role != :admin', { admin: ROLES.ADMIN })
      .andWhere('user.deleted != :deleted', { deleted: true });

    if (query.organizationId) {
      qb.andWhere('user.organizationId = :organizationId', {
        organizationId: query.organizationId,
      });
    }

    if (query.role && query.role !== 'admin') {
      qb.andWhere('user.role = :role', { role: query.role });
    }

    if (query.search) {
      qb.andWhere(
        `(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.name ILIKE :search)`,
        { search: `%${query.search}%` },
      );
    }

    const [users, totalCount] = await qb
      .select([
        'user.id',
        'user.name',
        'user.email',
        'user.role',
        'user.profilePic',
        'user.organization',
      ])
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const usersWithCourseCount = await Promise.all(
      users.map(async (user) => {
        const courseCount = await this.assigneeTrackerService.count({
          organizationId: user.organization?.id,
          deleted: false,
        });
        user.profilePic = user.profilePic
          ? `${process.env.IMAGE_HOST_URL}${user.profilePic}`
          : '';
        return { ...user, courseCount };
      }),
    );

    return {
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      list: usersWithCourseCount,
    };
  }

  async save(data: Partial<User>) {
    const user = this.userRepo.create(data);
    return await this.userRepo.save(user);
  }

  async findById(id: string) {
    return await this.userRepo.findOne({
      where: { id },
      relations: ['organization'],
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        profilePic: true,
        organization: true,
      },
    });
  }

  async findByQuery(query: any) {
    return await this.userRepo.findOne({
      where: query,
      relations: ['organization'],
      select: [
        'id',
        'firstName',
        'lastName',
        'email',
        'profilePic',
        'role',
        'organization',
      ],
    });
  }

  async updateById(id: string, updateData: Partial<User>) {
    await this.userRepo.update(id, updateData);
    return await this.findById(id);
  }

  async deleteById(id: string) {
    return await this.userRepo.delete(id);
  }

  async dashboardData() {
    const dashboardData: any = {};
    dashboardData.totalOrganizations =
      await this.organizationServices.getCounts({ deleted: false });
    // dashboardData.totalTrainers = await this.userRepo.count({
    //   where: { role: ROLES.TRAINER, deleted: false, status: Status.VERIFIED },
    // });
    // dashboardData.totalLearners = await this.userRepo.count({
    //   where: { role: ROLES.LEARNER, deleted: false, status: Status.VERIFIED },
    // });
    // dashboardData.totalVideos = await this.courseVideoServices.count({
    //   deleted: false,
    // });
    // dashboardData.totalViews = await this.courseVideoServices.getViewsCount({
    //   deleted: false,
    // });
    // dashboardData.totalSuccessVideos = await this.videoProgressService.count({
    //   deleted: false,
    //   completedPercentage: 95,
    // });

    // You can continue adding logic for learner/trainer graphs like before, but using TypeORM QueryBuilder or raw SQL

    return dashboardData;
  }
}
