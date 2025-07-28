import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AssigneeTrackerService } from 'src/assigneeTracker/assigneeTracker.service';
import { UsersService } from 'src/users/users.service';
import { ROLES } from 'src/utils/constants';
import { ILike, In, Not, Repository } from 'typeorm';
import { Organization } from './entities/organization.entity';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    private usersService: UsersService,
    private assigneeTrackerService: AssigneeTrackerService,
  ) {}
  async findAllOrganization(reqQuery) {
    const page = reqQuery.page ? parseInt(reqQuery.page) : 1;
    const limit = reqQuery.limit ? parseInt(reqQuery.limit) : 10;
    const skip = (page - 1) * limit;

    const queryBuilder = this.organizationRepository
      .createQueryBuilder('organization')
      .where('organization.deleted != :deleted', { deleted: true });

    if (reqQuery.search) {
      queryBuilder.andWhere('organization.name ILIKE :search', {
        search: `%${reqQuery.search}%`,
      });
    }

    const [organizations, totalCount] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    for (const org of organizations) {
      console.log(`🏢 Org: ${org.name} (${org.id})`);

      const learnerCount = await this.usersService.userCounts({
        where: {
          organization: { id: org.id },
          role: ROLES.LEARNER,
          deleted: false,
        },
      });

      const trainerCount = await this.usersService.userCounts({
        where: {
          organization: { id: org.id },
          role: ROLES.TRAINER,
          deleted: false,
        },
      });

      const courseCount = await this.assigneeTrackerService.count({
        where: {
          organization: { id: org.id },
          deleted: false,
        },
      });

      org.image = org.image ? `${process.env.IMAGE_HOST_URL}${org.image}` : '';
      org['learnerCount'] = learnerCount;
      org['trainerCount'] = trainerCount;
      org['courseCount'] = courseCount;
    }

    const totalPages = Math.ceil(totalCount / limit);
    const currentPage = page;

    return {
      totalCount,
      totalPages,
      currentPage,
      list: organizations,
    };
  }

  async save(data) {
    return await this.organizationRepository.save(data);
  }

  async findById(id: string) {
    return await this.organizationRepository.findOne({ where: { id } });
  }

  async findAll(query) {
    return await this.organizationRepository.find({ where: query });
  }

  async isExist(query) {
    return await this.organizationRepository.find({ where: query });
  }

  async findByQuery(query) {
    return await this.organizationRepository.findOne({ where: query });
  }

  async updateById(id: string, updateData) {
    await this.organizationRepository.update(id, updateData);
    return await this.findById(id);
  }

  async deleteById(id: string) {
    return await this.organizationRepository.delete(id);
  }

  async findOne(query: Partial<Organization>): Promise<Organization | null> {
    return await this.organizationRepository.findOne({ where: query });
  }

  async updateByQuery(query: any, updateData: Partial<Organization>) {
    const record = await this.organizationRepository.findOne({ where: query });
    if (record) {
      await this.organizationRepository.update(record.id, updateData);
      return await this.findById(record.id);
    }
    return null;
  }

  async getUnassignedOrganization(organizationIds: string[], reqQuery) {
    const page = parseInt(reqQuery.page) || 1;
    const limit = parseInt(reqQuery.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {
      id: Not(In(organizationIds)),
      deleted: false,
    };

    if (reqQuery.search) {
      where.name = ILike(`%${reqQuery.search}%`);
    }

    const [organizations, totalCount] =
      await this.organizationRepository.findAndCount({
        where,
        order: { createdAt: 'DESC' },
        skip,
        take: limit,
      });

    const organizationsWithCounts = await Promise.all(
      organizations.map(async (organization) => {
        const learnerCount = await this.usersService.userCounts({
          where: {
            organization: { id: organization.id },
            role: ROLES.LEARNER,
            deleted: false,
          },
        });

        const trainerCount = await this.usersService.userCounts({
          where: {
            organization: { id: organization.id },
            role: ROLES.TRAINER,
            deleted: false,
          },
        });

        const courseCount = await this.assigneeTrackerService.count({
          where: {
            organization: { id: organization.id },
            deleted: false,
          },
        });

        return {
          ...organization,
          image: organization.image
            ? `${process.env.IMAGE_HOST_URL}${organization.image}`
            : '',
          learnerCount,
          trainerCount,
          courseCount,
        };
      }),
    );

    return {
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      list: organizationsWithCounts,
    };
  }

  async getAssignedOrganization(organizationIds: string[], reqQuery) {
    const page = parseInt(reqQuery.page) || 1;
    const limit = parseInt(reqQuery.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {
      id: In(organizationIds),
      deleted: false,
    };

    if (reqQuery.search) {
      where.name = ILike(`%${reqQuery.search}%`);
    }

    const [organizations, totalCount] =
      await this.organizationRepository.findAndCount({
        where,
        order: { createdAt: 'DESC' },
        skip,
        take: limit,
      });

    const organizationsWithCounts = await Promise.all(
      organizations.map(async (organization) => {
        const learnerCount = await this.usersService.userCounts({
          organizationId: organization.id,
          role: ROLES.LEARNER,
          deleted: false,
        });

        const trainerCount = await this.usersService.userCounts({
          organizationId: organization.id,
          role: ROLES.TRAINER,
          deleted: false,
        });

        const courseCount = await this.assigneeTrackerService.count({
          where: {
            organization: { id: organization.id },
            deleted: false,
          },
        });

        return {
          ...organization,
          image: organization.image
            ? `${process.env.IMAGE_HOST_URL}${organization.image}`
            : '',
          learnerCount,
          trainerCount,
          courseCount,
        };
      }),
    );

    return {
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      list: organizationsWithCounts,
    };
  }

  async getCounts(query) {
    return await this.organizationRepository.count({ where: query });
  }
}
