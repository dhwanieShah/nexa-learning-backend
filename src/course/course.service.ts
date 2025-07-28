import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, Not, In } from 'typeorm';
import { Course } from './entities/course.entity';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,
  ) {}

  async findAllCourse(reqQuery: any) {
    const page = reqQuery.page ? parseInt(reqQuery.page) : 1;
    const limit = reqQuery.limit ? parseInt(reqQuery.limit) : 10;
    const skip = (page - 1) * limit;

    const where: any = {
      deleted: Not(true),
    };

    if (reqQuery.search) {
      where.title = ILike(`%${reqQuery.search}%`);
    }

    if (reqQuery.languageCode) {
      where.languageCode = ILike(`%${reqQuery.languageCode}%`);
    }

    const [list, totalCount] = await this.courseRepo.findAndCount({
      where,
      skip,
      take: limit,
      loadRelationIds: true, // instead of loading full relation
    });

    const courseWithImage = list.map((course) => {
      if (course.image) {
        course.image = `${process.env.IMAGE_HOST_URL}${course.image}`;
      }
      return course;
    });

    return {
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      list: courseWithImage,
    };
  }

  async save(data: Partial<Course>) {
    const entity = this.courseRepo.create(data);
    return await this.courseRepo.save(entity);
  }

  async findById(id: string) {
    return await this.courseRepo.findOne({ where: { id, deleted: false } });
  }

  async isExist(query: Partial<Course>) {
    return await this.courseRepo.find({ where: query });
  }

  async findByQuery(query: any) {
    return await this.courseRepo.findOne(query);
  }

  async updateById(id: string, data) {
    await this.courseRepo.update(id, data);
    return await this.findById(id);
  }

  async deleteById(id: string) {
    return await this.courseRepo.update(id, {
      deleted: true,
      deletedAt: new Date(),
    });
  }

  async userCounts(query: any) {
    return await this.courseRepo.count({ where: query });
  }

  async unAssignedCourse(assignedIds: string[], reqQuery: any) {
    const page = reqQuery.page ? parseInt(reqQuery.page) : 1;
    const limit = reqQuery.limit ? parseInt(reqQuery.limit) : 10;
    const skip = (page - 1) * limit;

    const where: any = {
      deleted: Not(true),
      id: Not(In(assignedIds)),
    };

    if (reqQuery.search) {
      where.title = ILike(`%${reqQuery.search}%`);
    }

    const [list, totalCount] = await this.courseRepo.findAndCount({
      where,
      skip,
      take: limit,
    });

    const courseWithImage = list.map((course) => {
      if (course.image) {
        course.image = `${process.env.IMAGE_HOST_URL}${course.image}`;
      }
      return course;
    });

    return {
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      list: courseWithImage,
    };
  }

  async getUnassignedCourses(courseIds: string[], reqQuery: any) {
    return this.unAssignedCourse(courseIds, reqQuery);
  }

  async getAssignedCourses(courseIds: string[], reqQuery: any) {
    const page =
      reqQuery.pagination === 'false' ? 1 : parseInt(reqQuery.page || '1');
    const limit =
      reqQuery.pagination === 'false'
        ? await this.courseRepo.count()
        : parseInt(reqQuery.limit || '10');
    const skip = (page - 1) * limit;

    const where: any = {
      deleted: false,
      id: In(courseIds),
    };

    if (reqQuery.search) {
      where.title = ILike(`%${reqQuery.search}%`);
    }
    if (reqQuery.languageCode) {
      where.languageCode = ILike(`%${reqQuery.languageCode}%`);
    }

    const [list, totalCount] = await this.courseRepo.findAndCount({
      where,
      skip,
      take: limit,
      loadRelationIds: true, // instead of loading full relation
    });

    const courseWithImage = list.map((course) => {
      if (course.image) {
        course.image = `${process.env.IMAGE_HOST_URL}${course.image}`;
      }
      return course;
    });

    const result: any =
      reqQuery.pagination === 'false'
        ? { list: courseWithImage }
        : {
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
            list: courseWithImage,
          };

    return result;
  }

  async findAll(query: any) {
    return await this.courseRepo.find({ where: query });
  }

  async getCoursesWithPagination(
    courseIds: string[],
    reqQuery: any,
    userCourseList: any[],
    userId: string,
  ) {
    const page = parseInt(reqQuery.page || '1');
    const limit = parseInt(reqQuery.limit || '10');
    const skip = (page - 1) * limit;

    const where: any = {
      id: In(courseIds),
      deleted: false,
    };

    if (reqQuery.search) {
      where.title = ILike(`%${reqQuery.search}%`);
    }

    const [courses, totalCount] = await this.courseRepo.findAndCount({
      where,
      skip,
      take: limit,
    });

    const coursesWithProgress = await Promise.all(
      courses.map(async (course) => {
        if (course.image) {
          course.image = `${process.env.IMAGE_HOST_URL}${course.image}`;
        }

        const findUserCourse = userCourseList.find(
          (e) => e.course === course.id,
        );
        let totalTimeSpend = 0;
        let totalVideoTime = 0;

        if (findUserCourse) {
          // const videos = await this.videoProgressService.findAll({
          //   course: findUserCourse.course,
          //   user: userId,
          // });
          // if (videos?.length) {
          //   totalTimeSpend = videos.reduce(
          //     (sum, v) => sum + parseFloat(v.consumedTime),
          //     0,
          //   );
          //   totalVideoTime = videos.reduce(
          //     (sum, v) => sum + parseFloat(v.totalTime),
          //     0,
          //   );
          // }
        }

        return {
          ...course,
          completedPercentage: findUserCourse
            ? Math.round(findUserCourse.completedPercentage)
            : 0,
          isCompleted: findUserCourse ? findUserCourse.isCompleted : false,
          totalTimeSpend: totalTimeSpend.toString(),
          totalVideoTime: totalVideoTime.toString(),
        };
      }),
    );

    return {
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      list: coursesWithProgress,
    };
  }

  async getNonLearningCoursesWithPagination(
    courseIds: string[],
    reqQuery: any,
  ) {
    const page = parseInt(reqQuery.page || '1');
    const limit = parseInt(reqQuery.limit || '10');
    const skip = (page - 1) * limit;

    const where: any = {
      id: In(courseIds),
      deleted: false,
    };

    if (reqQuery.search) {
      where.title = ILike(`%${reqQuery.search}%`);
    }

    const [courses, totalCount] = await this.courseRepo.findAndCount({
      where,
      skip,
      take: limit,
    });

    const coursesWithImages = courses.map((course) => {
      if (course.image) {
        course.image = `${process.env.IMAGE_HOST_URL}${course.image}`;
      }
      return course;
    });

    return {
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      list: coursesWithImages,
    };
  }
}
