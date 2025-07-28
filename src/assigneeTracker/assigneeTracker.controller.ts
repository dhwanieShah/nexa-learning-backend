import {
  Controller,
  Delete,
  Get,
  Param,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiHeader, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { commonResponse } from 'helper';
import * as moment from 'moment';
import { LANGUAGE_CODE, ROLES } from 'src/utils/constants';
import { validate as isUUID } from 'uuid';
import { JwtAuthGuard } from '../auth/role/jwt-auth.guard';
import { RoleGuard } from '../auth/role/role.guard';
import { Roles } from '../auth/role/roles.decorator';
import { AssigneeTrackerService } from './assigneeTracker.service';

@Controller('assigneeTracker')
@ApiTags('AssigneeTracker')
@ApiHeader({
  name: 'languagecode',
  description: 'Add Language Code From "en" or "fr"',
})
export class AssigneeTrackerController {
  constructor(private assigneeTrackerService: AssigneeTrackerService) {}

  /*
   *   Find AssigneeTracker By Id
   */
  @Get(':id')
  @ApiSecurity('jwt-auth')
  @Roles(ROLES.ADMIN, ROLES.TRAINER, ROLES.LEARNER)
  @UseGuards(JwtAuthGuard, RoleGuard)
  async findCourse(@Param('id') id: string, @Req() req, @Res() res) {
    const languageCode = req.headers.languagecode || LANGUAGE_CODE.EN;

    try {
      if (!isUUID(id)) {
        return commonResponse.error(
          languageCode,
          res,
          'PLEASE_ENTER_CORRECT_ID',
          400,
          {},
        );
      }

      const course = await this.assigneeTrackerService.findByQuery({
        id,
        deleted: false,
      });

      if (!course) {
        return commonResponse.customResponse(
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

  // /*
  //  *   Delete AssigneeTracker
  //  */
  // @Delete(':id')
  // @ApiSecurity('jwt-auth')
  // @Roles(ROLES.ADMIN)
  // @UseGuards(JwtAuthGuard, RoleGuard)
  // async deleteCourse(@Param('id') id: string, @Req() req, @Res() res) {
  //   const languageCode = req.headers.languagecode || LANGUAGE_CODE.EN;

  //   try {
  //     const course = await this.assigneeTrackerService.findById(id);
  //     if (!course || course.deleted) {
  //       return commonResponse.error(
  //         languageCode,
  //         res,
  //         'COURSE_SECTION_NOT_FOUND',
  //         400,
  //         {},
  //       );
  //     }

  //     const updateData = {
  //       deleted: true,
  //       deletedAt: moment.utc().toDate(),
  //       deletedBy: req.user?.id, // UUID string or number
  //     };

  //     const deleteResult = await this.assigneeTrackerService.updateById(
  //       id,
  //       updateData,
  //     );
  //     console.log(
  //       '🚀 ~ AssigneeTrackerController ~ deleteCourse ~ deleteResult:',
  //       deleteResult,
  //     );

  //     if (deleteResult) {
  //       return commonResponse.success(
  //         languageCode,
  //         res,
  //         'COURSE_SECTION_DELETED',
  //         200,
  //         {},
  //       );
  //     }

  //     return commonResponse.customResponse(
  //       languageCode,
  //       res,
  //       'SERVER_ERROR',
  //       400,
  //       {},
  //     );
  //   } catch (error) {
  //     console.error('AssigneeTrackerService deleteById error', error);
  //     return commonResponse.error(
  //       languageCode,
  //       res,
  //       'DEFAULT_INTERNAL_SERVER_ERROR',
  //       500,
  //       {},
  //     );
  //   }
  // }
}
