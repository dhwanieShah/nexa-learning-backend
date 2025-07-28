// src/courseSection/courseSection.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, In, FindOptionsWhere } from 'typeorm';
import { CourseSection } from './entities/courseSection.entity';
import { Course } from '../course/entities/course.entity';
import { User } from '../auth/entities/users.entity';

@Injectable()
export class CourseSectionService {
  constructor(
    @InjectRepository(CourseSection)
    private courseSectionRepository: Repository<CourseSection>,
  ) {}

  async findAllCourseSection(query): Promise<any> {
    const page = query.page ? parseInt(query.page) : 1;
    const limit = query.limit ? parseInt(query.limit) : 10;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<CourseSection> = { deleted: false };

    if (query.baseCourseId) {
      where.baseCourse = { id: query.baseCourseId };
    }
    if (query.languageCode) {
      where.languageCode = query.languageCode;
    }

    if (query.search) {
      where.title = ILike(`%${query.search}%`);
    }

    const [list, totalCount] = await this.courseSectionRepository.findAndCount({
      where,
      relations: ['course'],
      skip,
      take: limit,
    });

    return {
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      list,
    };
  }

  async findAll(query: any): Promise<CourseSection[]> {
    return await this.courseSectionRepository.find({ where: query });
  }

  async isExist(query): Promise<CourseSection[]> {
    return await this.courseSectionRepository.find({ where: query });
  }

  async updateById(id: string, data): Promise<CourseSection> {
    await this.courseSectionRepository.update(id, data);
    return this.findById(id);
  }

  async deleteById(id: string): Promise<any> {
    return await this.courseSectionRepository.delete(id);
  }

  async count(query): Promise<number> {
    return await this.courseSectionRepository.count(query);
  }

  async findAllCourseSectionByIds(sectionIds: string[], query): Promise<any> {
    const page = query.page ? parseInt(query.page) : 1;
    const limit = query.limit ? parseInt(query.limit) : 10;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<CourseSection> = {
      id: In(sectionIds),
      deleted: false,
    };

    if (query.courseId) {
      where.course = { id: query.courseId };
    }

    if (query.search) {
      where.title = ILike(`%${query.search}%`);
    }

    const [list, totalCount] = await this.courseSectionRepository.findAndCount({
      where,
      skip,
      take: limit,
      select: ['id', 'title'],
    });

    return {
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      list,
    };
  }

  async findByCustomQuery(
    query,
    select = [],
    relations = [],
  ): Promise<CourseSection> {
    return await this.courseSectionRepository.findOne({
      where: query,
      select,
      relations,
    });
  }

  async save(data): Promise<CourseSection> {
    return this.courseSectionRepository.save(data);
  }

  async updateBaseSection(id: string, baseId: string): Promise<void> {
    await this.courseSectionRepository.update(id, {
      baseSection: { id: baseId },
    });
  }
  //#endregion

  //#region ======== Find Methods =========
  async findByQuery(query: any): Promise<CourseSection> {
    return this.courseSectionRepository.findOne({
      where: query,
      relations: ['course'],
      select: {
        id: true,
        title: true,
        course: { id: true, title: true, image: true, description: true },
      },
    });
  }

  async findById(id: string): Promise<CourseSection> {
    return this.courseSectionRepository.findOne({
      where: { id },
      relations: ['course'],
      select: {
        id: true,
        title: true,
        course: { id: true, title: true, image: true, description: true },
      },
    });
  }

  async findBaseSection(baseCourseId: string): Promise<CourseSection | null> {
    return await this.courseSectionRepository.findOne({
      where: {
        baseCourse: { id: baseCourseId },
        deleted: false,
      },
      order: { createdAt: 'ASC' }, // This will work now
    });
  }

  //#endregion
}
