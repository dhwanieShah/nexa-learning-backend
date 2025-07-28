import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssigneeTracker } from './entities/assigneeTracker.entity';

@Injectable()
export class AssigneeTrackerService {
  constructor(
    @InjectRepository(AssigneeTracker)
    private readonly assigneeTrackerRepository: Repository<AssigneeTracker>,
  ) {}

  async findById(id: string): Promise<AssigneeTracker | null> {
    return await this.assigneeTrackerRepository.findOne({
      where: { id, deleted: false },
    });
  }

  async findByQuery(query: any): Promise<AssigneeTracker | null> {
    return await this.assigneeTrackerRepository.findOne({
      where: query,
      relations: ['course', 'organization'],
    });
  }

  async updateById(
    id: string,
    data: Partial<AssigneeTracker>,
  ): Promise<AssigneeTracker | null> {
    await this.assigneeTrackerRepository.update({ id }, data);
    return this.findById(id);
  }

  async deleteById(id: string): Promise<void> {
    await this.assigneeTrackerRepository.delete({ id });
  }

  async save(data: Partial<AssigneeTracker>): Promise<AssigneeTracker> {
    const entity = this.assigneeTrackerRepository.create(data);
    return await this.assigneeTrackerRepository.save(entity);
  }

  async findAll(query: any): Promise<AssigneeTracker[]> {
    const where: any = {};

    if (query.organization) {
      where.organization = { id: query.organization };
    }

    if (query.course) {
      where.course = { id: query.course };
    }

    if (typeof query.deleted === 'boolean') {
      where.deleted = query.deleted;
    }

    return this.assigneeTrackerRepository.find({
      where,
      relations: ['course', 'organization'],
    });
  }

  async isExist(query: any): Promise<AssigneeTracker[]> {
    return await this.assigneeTrackerRepository.find({ where: query });
  }
  async assignCourse(
    courseId: string,
    organizationIds: string[],
  ): Promise<AssigneeTracker[]> {
    const assignments: AssigneeTracker[] = [];

    for (const orgId of organizationIds) {
      const existing = await this.assigneeTrackerRepository.findOne({
        where: {
          course: { id: courseId },
          organization: { id: orgId },
          deleted: false,
        },
      });

      if (!existing) {
        const assignment = this.assigneeTrackerRepository.create({
          course: { id: courseId },
          organization: { id: orgId },
        });
        assignments.push(await this.assigneeTrackerRepository.save(assignment));
      }
    }

    return assignments;
  }

  async assignOrganization(
    organizationId: string,
    courseIds: string[],
  ): Promise<AssigneeTracker[]> {
    const assignments: AssigneeTracker[] = [];

    for (const courseId of courseIds) {
      const existing = await this.assigneeTrackerRepository.findOne({
        where: {
          course: { id: courseId },
          organization: { id: organizationId },
          deleted: false,
        },
      });

      if (!existing) {
        const assignment = this.assigneeTrackerRepository.create({
          course: { id: courseId },
          organization: { id: organizationId },
        });
        assignments.push(await this.assigneeTrackerRepository.save(assignment));
      }
    }

    return assignments;
  }

  async unassign(
    courseId: string,
    organizationId: string,
    updateData,
  ): Promise<AssigneeTracker | null> {
    await this.assigneeTrackerRepository.update(
      {
        course: { id: courseId },
        organization: { id: organizationId },
        deleted: false,
      },
      updateData,
    );

    return this.assigneeTrackerRepository.findOne({
      where: {
        course: { id: courseId },
        organization: { id: organizationId },
      },
    });
  }

  async count(query) {
    const data = await this.assigneeTrackerRepository.count(query);
    return data;
  }
  async customFindAll(query: any): Promise<AssigneeTracker[]> {
    return await this.assigneeTrackerRepository.find({ where: query });
  }
}
