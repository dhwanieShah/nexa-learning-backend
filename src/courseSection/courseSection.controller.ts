import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiHeader,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { LANGUAGE_CODE, ROLES } from 'src/utils/constants';
import { JwtAuthGuard } from '../auth/role/jwt-auth.guard';
import { RoleGuard } from '../auth/role/role.guard';
import { Roles } from '../auth/role/roles.decorator';
import { CourseSectionService } from './courseSection.service';
import { CourseSectionAddDto } from './dto/CourseSectionAddDto.dto';
import { CourseSectionUpdateDto } from './dto/CourseSectionUpdateDto.dto';
import { PaginatedQueryDto } from './dto/pagination-query.dto';
import { UploadFile } from 'helper/aws.helper';
import * as moment from 'moment';
import { commonResponse } from 'helper';
import { CourseService } from 'src/course/course.service';

@Controller('courseSection')
@ApiTags('CourseSection')
@ApiHeader({
  name: 'languagecode',
  description: 'Add Language Code From "en" or "fr"',
})
export class CourseSectionController {
  constructor(
    private courseSectionService: CourseSectionService,
    private courseService: CourseService,
    private awsS3: UploadFile,
  ) {}

  @Post('/add')
  @ApiSecurity('jwt-auth')
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CourseSectionAddDto })
  @Roles(ROLES.ADMIN)
  @UseGuards(JwtAuthGuard, RoleGuard)
  async addCourseSection(
    @Body() dto: CourseSectionAddDto,
    @UploadedFile() image,
    @Req() req,
    @Res() res,
  ) {
    const languageCode = req.headers.languagecode || LANGUAGE_CODE.EN;

    try {
      const exists = await this.courseSectionService.findByQuery({
        title: dto.title,
        languageCode: dto.languageCode,
        course: { id: dto.course },
        baseCourse: { id: dto.baseCourse },
        deleted: false,
      });

      if (exists) {
        return commonResponse.error(
          languageCode,
          res,
          'COURSE_SECTION_ALLREADY_EXIST',
          400,
          {},
        );
      }
      const course = await this.courseService.findByQuery({
        where: {
          id: dto.course,
          deleted: false,
        },
      });
      if (!course) {
        return commonResponse.error(
          languageCode,
          res,
          'COURSE_NOT_FOUND',
          400,
          {},
        );
      }

      if (course.languageCode !== dto.languageCode) {
        return commonResponse.error(
          languageCode,
          res,
          'COURSE_LANGUAGE_MISMATCH',
          400,
          {},
        );
      }

      // Create section first
      const created = await this.courseSectionService.save({
        ...dto,
        createdBy: { id: req.user.id },
      });

      // If no base section yet, make this one its own base
      const baseSection = await this.courseSectionService.findBaseSection(
        dto.baseCourse,
      );
      const baseId = baseSection ? baseSection.id : created.id;

      await this.courseSectionService.updateBaseSection(created.id, baseId);
      created.baseSection = await this.courseSectionService.findById(baseId);

      return commonResponse.success(
        languageCode,
        res,
        'COURSE_SECTION_ADD',
        200,
        created,
      );
    } catch (error) {
      console.log('🚀 ~ CourseSectionController ~ error:', error);
      return commonResponse.error(
        languageCode,
        res,
        'DEFAULT_INTERNAL_SERVER_ERROR',
        500,
        {},
      );
    }
  }

  @Get('/list')
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
      const result =
        await this.courseSectionService.findAllCourseSection(query);
      return commonResponse.paginationResponse(
        languageCode,
        res,
        'COURSE_SECTION_LIST',
        200,
        result,
      );
    } catch (error) {
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
      const course = await this.courseSectionService.findById(id);
      if (!course || course.deleted) {
        return commonResponse.error(
          languageCode,
          res,
          'COURSE_SECTION_NOT_FOUND',
          400,
          {},
        );
      }
      return commonResponse.success(
        languageCode,
        res,
        'COURSE_SECTION_DETAIL_FOUND',
        200,
        course,
      );
    } catch (error) {
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
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CourseSectionUpdateDto })
  @Roles(ROLES.ADMIN)
  @UseGuards(JwtAuthGuard, RoleGuard)
  async updateCourse(
    @Param('id') id: string,
    @Body() body: CourseSectionUpdateDto,
    @UploadedFile() image,
    @Req() req,
    @Res() res,
  ) {
    const languageCode = req.headers.languagecode || LANGUAGE_CODE.EN;

    try {
      const courseSection = await this.courseSectionService.findById(id);
      if (!courseSection || courseSection.deleted) {
        return commonResponse.error(
          languageCode,
          res,
          'COURSE_SECTION_NOT_FOUND',
          400,
          {},
        );
      }

      const payload = {
        ...body,
        updatedBy: { id: req.user.id },
      };

      const updated = await this.courseSectionService.updateById(id, payload);

      return commonResponse.success(
        languageCode,
        res,
        'COURSE_SECTION_UPDATE',
        200,
        updated,
      );
    } catch (error) {
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
      const course = await this.courseSectionService.findById(id);
      if (!course || course.deleted) {
        return commonResponse.error(
          languageCode,
          res,
          'COURSE_SECTION_NOT_FOUND',
          400,
          {},
        );
      }

      const deletedData = await this.courseSectionService.updateById(id, {
        deleted: true,
        deletedAt: moment.utc().toDate(),
        deletedBy: { id: req.user.id },
      });

      return commonResponse.success(
        languageCode,
        res,
        'COURSE_SECTION_DELETED',
        200,
        {},
      );
    } catch (error) {
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
