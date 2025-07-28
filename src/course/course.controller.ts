// TypeORM & PostgreSQL version of the CourseController
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  Req,
  Res,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiTags,
  ApiHeader,
  ApiSecurity,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { CourseService } from './course.service';
import { AssigneeTrackerService } from 'src/assigneeTracker/assigneeTracker.service';
import { UploadFile } from '../../helper/aws.helper';
import { JwtAuthGuard } from '../auth/role/jwt-auth.guard';
import { RoleGuard } from '../auth/role/role.guard';
import { Roles } from '../auth/role/roles.decorator';
import { ROLES, LANGUAGE_CODE } from 'src/utils/constants';
import { FileInterceptor } from '@nestjs/platform-express';
import { PaginatedQueryDto } from './dto/pagination-query.dto';
import { CourseAddDto } from './dto/CourseAddDto.dto';
import { CourseUpdateDto } from './dto/CourseUpdateDto.dto';
import { AssignCourseDto } from './dto/AssignCourseDto.dto';
import { UnassignCourseDto } from './dto/UnassignCourseDto.dto';
import { commonResponse } from 'helper';
import * as moment from 'moment';
import { CourseSectionService } from 'src/courseSection/courseSection.service';

@Controller('course')
@ApiTags('Course')
@ApiHeader({
  name: 'languagecode',
  description: 'Add Language Code From "en" or "fr"',
})
export class CourseController {
  constructor(
    private courseService: CourseService,
    private awsS3: UploadFile,
    private assigneeTrackerService: AssigneeTrackerService,
    private courseSectionService: CourseSectionService,
  ) {}

  @Post('/add')
  @ApiSecurity('jwt-auth')
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Course data with an image file',
    type: CourseAddDto,
  })
  @Roles(ROLES.ADMIN)
  @UseGuards(JwtAuthGuard, RoleGuard)
  async addCourse(
    @Body() dto: CourseAddDto,
    @UploadedFile() image,
    @Req() req,
    @Res() res,
  ) {
    const languageCode = req.headers.languagecode || LANGUAGE_CODE.EN;
    try {
      const isEnglish = dto.languageCode === LANGUAGE_CODE.EN;

      if (isEnglish) {
        // 🔒 Check for existing English course with same title
        const exists = await this.courseService.findByQuery({
          where: {
            title: dto.title,
            languageCode: LANGUAGE_CODE.EN,
            deleted: false,
          },
        });

        if (exists) {
          return commonResponse.error(
            languageCode,
            res,
            'COURSE_ALREADY_EXIST',
            400,
            {},
          );
        }
      }
      console.log(
        '🚀 ~ CourseController ~ dto.baseCourseId :',
        dto.baseCourseId,
      );
      // 🔒 Check if translation for same baseCourseId and language already exists
      if (dto.baseCourseId) {
        const exists = await this.courseService.findByQuery({
          where: {
            baseCourse: { id: dto.baseCourseId },
            languageCode: dto.languageCode,
            deleted: false,
          },
        });

        if (exists) {
          return commonResponse.error(
            languageCode,
            res,
            'COURSE_ALREADY_EXIST_IN_THIS_LANGUAGE',
            400,
            {},
          );
        }
      }
      // 📸 Handle image upload
      const imageUrl = image
        ? await this.awsS3.uploadFile(
            image.originalname,
            image.buffer,
            image.mimetype,
            'course',
          )
        : '';

      let baseCourse = null;
      if (!isEnglish && dto.baseCourseId) {
        baseCourse = await this.courseService.findById(dto.baseCourseId); // make sure this returns the full entity
      }

      const course = await this.courseService.save({
        ...dto,
        image: imageUrl,
        createdBy: req.user.id,
        baseCourse: baseCourse, // full object here
      });

      if (isEnglish) {
        await this.courseService.updateById(course.id, {
          baseCourse: course, // full object, valid
        });
      }

      return commonResponse.success(
        languageCode,
        res,
        'COURSE_ADD',
        200,
        course,
      );
    } catch (e) {
      console.log('🚀 ~ CourseController ~ e:', e);
      return commonResponse.error(
        languageCode,
        res,
        'DEFAULT_INTERNAL_SERVER_ERROR',
        500,
        {},
      );
    }
  }

  @Get('/courseList')
  @ApiSecurity('jwt-auth')
  @Roles(ROLES.ADMIN, ROLES.TRAINER, ROLES.LEARNER)
  @UseGuards(JwtAuthGuard, RoleGuard)
  async getAllfindAllCourse(
    @Query() query: PaginatedQueryDto,
    @Req() req,
    @Res() res,
  ) {
    const languageCode = req.headers.languagecode || LANGUAGE_CODE.EN;
    try {
      const assigneeTrackers = await this.assigneeTrackerService.findAll({
        organization: query.organizationId,
        deleted: false,
      });
      const courseIds = [...new Set(assigneeTrackers.map((a) => a.course.id))];
      const courseList = query.organizationId
        ? await this.courseService.getAssignedCourses(courseIds, query)
        : await this.courseService.findAllCourse(query);
      return commonResponse.paginationResponse(
        languageCode,
        res,
        'COURSE_LIST',
        200,
        courseList,
      );
    } catch (e) {
      console.log('🚀 ~ CourseController ~ e:', e);
      return commonResponse.error(
        languageCode,
        res,
        'DEFAULT_INTERNAL_SERVER_ERROR',
        500,
        {},
      );
    }
  }

  @Get('/unassignedCourseList')
  @ApiSecurity('jwt-auth')
  @Roles(ROLES.ADMIN, ROLES.TRAINER, ROLES.LEARNER)
  @UseGuards(JwtAuthGuard, RoleGuard)
  async unAssignedCourse(
    @Query() query: PaginatedQueryDto,
    @Req() req,
    @Res() res,
  ) {
    const languageCode = req.headers.languagecode || LANGUAGE_CODE.EN;
    try {
      const assigneeTrackers = await this.assigneeTrackerService.findAll({
        organization: query.organizationId,
        deleted: false,
      });
      const courseIds = [...new Set(assigneeTrackers.map((a) => a.course.id))];
      const courseList = await this.courseService.getUnassignedCourses(
        courseIds,
        query,
      );
      return commonResponse.paginationResponse(
        languageCode,
        res,
        'UNASSIGNED_COURSE_LIST',
        200,
        courseList,
      );
    } catch (e) {
      return commonResponse.error(
        languageCode,
        res,
        'DEFAULT_INTERNAL_SERVER_ERROR',
        500,
        {},
      );
    }
  }

  @Get('/assignedCourseList')
  @ApiSecurity('jwt-auth')
  @Roles(ROLES.ADMIN, ROLES.TRAINER, ROLES.LEARNER)
  @UseGuards(JwtAuthGuard, RoleGuard)
  async assignListByCourse(
    @Query() query: PaginatedQueryDto,
    @Req() req,
    @Res() res,
  ) {
    console.log('🚀 ~ CourseController ~ query:', query);
    const languageCode = req.headers.languagecode || LANGUAGE_CODE.EN;
    try {
      const assigneeTrackers = await this.assigneeTrackerService.findAll({
        organization: query.organizationId,
        deleted: false,
      });
      console.log(
        '🚀 ~ CourseConsweftroller ~ assigneeTrackers:',
        assigneeTrackers,
      );
      const courseIds = [...new Set(assigneeTrackers.map((a) => a.course.id))];
      const courseList = await this.courseService.getAssignedCourses(
        courseIds,
        query,
      );
      return commonResponse.paginationResponse(
        languageCode,
        res,
        'ASSIGNED_ORGANIZATIONS_LIST',
        200,
        courseList,
      );
    } catch (e) {
      console.log('🚀 ~ CourseController ~ e:', e);
      return commonResponse.error(
        languageCode,
        res,
        'DEFAULT_INTERNAL_SERVER_ERROR',
        500,
        {},
      );
    }
  }

  @Get(':id')
  @ApiSecurity('jwt-auth')
  @Roles(ROLES.ADMIN, ROLES.TRAINER, ROLES.LEARNER)
  @UseGuards(JwtAuthGuard, RoleGuard)
  async findCourse(@Param('id') id: string, @Req() req, @Res() res) {
    const languageCode = req.headers.languagecode || LANGUAGE_CODE.EN;
    try {
      const course = await this.courseService.findByQuery({
        where: {
          id,
          deleted: false,
        },
        loadRelationIds: true, // instead of loading full relation
      });
      console.log('🚀 ~ CourseController ~ findCourse ~ course:', course);
      if (!course)
        return commonResponse.customResponse(
          languageCode,
          res,
          'COURSE_NOT_FOUND',
          400,
          {},
        );

      let courseTotalSection = await this.courseSectionService.count({
        where: {
          course: { id: course.id },
          languageCode: course.languageCode,
          deleted: false,
        },
      });

      const assignedCount = await this.assigneeTrackerService.count({
        where: {
          course: { id: course.id },
          deleted: false,
        },
      });

      const result = {
        ...course,
        totalSections: courseTotalSection,
        image: course.image
          ? `${process.env.IMAGE_HOST_URL}${course.image}`
          : '',
        assignedOrganization: assignedCount,
      };

      return commonResponse.success(
        languageCode,
        res,
        'COURSE_DETAIL_FOUND',
        200,
        result,
      );
    } catch (e) {
      console.log('🚀 ~ CourseController ~ findCourse ~ e:', e);
      return commonResponse.error(
        languageCode,
        res,
        'DEFAULT_INTERNAL_SERVER_ERROR',
        500,
        {},
      );
    }
  }

  @Put('unassign')
  @ApiSecurity('jwt-auth')
  @Roles(ROLES.ADMIN)
  @ApiBody({ type: UnassignCourseDto })
  @UseGuards(JwtAuthGuard, RoleGuard)
  async unassignCourseOrganization(
    @Body() body: UnassignCourseDto,
    @Req() req,
    @Res() res,
  ) {
    const languageCode = req.headers.languagecode || LANGUAGE_CODE.EN;
    try {
      const course = await this.courseService.findByQuery({
        where: {
          id: body.courseId,
          deleted: false,
        },
      });
      if (!course)
        return commonResponse.error(
          languageCode,
          res,
          'COURSE_NOT_FOUND',
          400,
          {},
        );

      const payload = {
        deleted: true,
        deletedAt: moment.utc().toISOString(),
        deletedBy: req.user.id,
      };
      await this.assigneeTrackerService.unassign(
        body.courseId,
        body.organizationId,
        payload,
      );
      return commonResponse.success(
        languageCode,
        res,
        'COURSE_ORGANIZATION_UNASSIGN_SUCCESSFUL',
        200,
        {},
      );
    } catch (e) {
      return commonResponse.error(
        languageCode,
        res,
        'DEFAULT_INTERNAL_SERVER_ERROR',
        500,
        {},
      );
    }
  }

  @Put(':id')
  @ApiSecurity('jwt-auth')
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CourseUpdateDto })
  @Roles(ROLES.ADMIN)
  @UseGuards(JwtAuthGuard, RoleGuard)
  async updateCourse(
    @Param('id') id: string,
    @Body() dto: CourseUpdateDto,
    @UploadedFile() image,
    @Req() req,
    @Res() res,
  ) {
    const languageCode = req.headers.languagecode || LANGUAGE_CODE.EN;
    try {
      const course = await this.courseService.findByQuery({
        where: {
          id,
          deleted: false,
        },
      });
      if (!course)
        return commonResponse.error(
          languageCode,
          res,
          'COURSE_NOT_FOUND',
          400,
          {},
        );

      if (course.image && image)
        await this.awsS3.deleteImageFromS3(course.image);
      const imageUrl = image
        ? await this.awsS3.uploadFile(
            image.originalname,
            image.buffer,
            image.mimetype,
            'course',
          )
        : course.image;
      const updateData = { ...dto, image: imageUrl, updatedBy: req.user.id };

      const updated = await this.courseService.updateById(id, updateData);
      return commonResponse.success(
        languageCode,
        res,
        'COURSE_UPDATE',
        200,
        updated,
      );
    } catch (e) {
      return commonResponse.error(
        languageCode,
        res,
        'DEFAULT_INTERNAL_SERVER_ERROR',
        500,
        {},
      );
    }
  }

  @Delete(':id')
  @ApiSecurity('jwt-auth')
  @Roles(ROLES.ADMIN)
  @UseGuards(JwtAuthGuard, RoleGuard)
  async deleteCourse(@Param('id') id: string, @Req() req, @Res() res) {
    const languageCode = req.headers.languagecode || LANGUAGE_CODE.EN;
    try {
      const course = await this.courseService.findByQuery({
        where: {
          id,
          deleted: false,
        },
      });
      if (!course)
        return commonResponse.error(
          languageCode,
          res,
          'COURSE_NOT_FOUND',
          400,
          {},
        );
      const data = {
        deleted: true,
        deletedAt: moment.utc().toISOString(),
        deletedBy: req.user.id,
      };
      await this.courseService.updateById(id, data);
      return commonResponse.success(
        languageCode,
        res,
        'COURSE_DELETED',
        200,
        {},
      );
    } catch (e) {
      return commonResponse.error(
        languageCode,
        res,
        'DEFAULT_INTERNAL_SERVER_ERROR',
        500,
        {},
      );
    }
  }

  @Put('assignCourse/:id')
  @ApiSecurity('jwt-auth')
  @Roles(ROLES.ADMIN)
  @UseGuards(JwtAuthGuard, RoleGuard)
  async assigneeCourse(
    @Param('id') id: string,
    @Body() body: AssignCourseDto,
    @Req() req,
    @Res() res,
  ) {
    const languageCode = req.headers.languagecode || LANGUAGE_CODE.EN;
    try {
      const course = await this.courseService.findByQuery({
        where: {
          id,
          deleted: false,
        },
      });
      if (!course)
        return commonResponse.error(
          languageCode,
          res,
          'COURSE_NOT_FOUND',
          400,
          {},
        );
      await this.assigneeTrackerService.assignCourse(id, body.assignedTo);
      return commonResponse.success(
        languageCode,
        res,
        'COURSE_ASSIGNEE_SUCCESSFULL',
        200,
        {},
      );
    } catch (e) {
      console.log('🚀 ~ CourseController ~ e:', e);
      return commonResponse.error(
        languageCode,
        res,
        'DEFAULT_INTERNAL_SERVER_ERROR',
        500,
        {},
      );
    }
  }
}
