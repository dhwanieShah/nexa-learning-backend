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
import { commonResponse } from 'helper';
import * as moment from 'moment';
import { AssigneeTrackerService } from 'src/assigneeTracker/assigneeTracker.service';
import { UsersService } from 'src/users/users.service';
import { LANGUAGE_CODE, ROLES } from 'src/utils/constants';
import { UploadFile } from '../../helper/aws.helper';
import { JwtAuthGuard } from '../auth/role/jwt-auth.guard';
import { RoleGuard } from '../auth/role/role.guard';
import { Roles } from '../auth/role/roles.decorator';
import { OrganizationAddDto } from './dto/OrganizationAddDto.dto';
import { OrganizationUpdateDto } from './dto/OrganizationUpdateDto.dto';
import { PaginatedQueryDto } from './dto/pagination-query.dto';
import { OrganizationService } from './organization.service';
import { AssigneByOrganizationDto } from './dto/AssigneByOrganizationDto.dto';
import { AssignCourseToOrganizationDto } from './dto/AssignCourseToOrganizationDto.dto';
import { ILike, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Organization } from './entities/organization.entity';

@Controller('organization')
@ApiTags('Organization')
@ApiHeader({
  name: 'languagecode',
  description: 'Add Language Code From "en" or "fr"',
})
export class OrganizationController {
  constructor(
    private organizationService: OrganizationService,
    private awsS3: UploadFile,
    private usersService: UsersService,
    private assigneeTrackerService: AssigneeTrackerService,
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
  ) {}

  @Post('/add')
  @ApiSecurity('jwt-auth')
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: OrganizationAddDto })
  @Roles(ROLES.ADMIN)
  @UseGuards(JwtAuthGuard, RoleGuard)
  async addOrganization(
    @Body() dto: OrganizationAddDto,
    @UploadedFile() image,
    @Req() req,
    @Res() res,
  ) {
    const languageCode = req.headers.languagecode || LANGUAGE_CODE.EN;
    try {
      const existing = await this.organizationService.findOne({
        name: dto.name,
        deleted: false,
      });
      if (existing)
        return commonResponse.error(
          languageCode,
          res,
          'ORGANIZATION_ALLREADY_EXIST',
          400,
          {},
        );

      let imageUrl = null;
      if (image) {
        imageUrl = await this.awsS3.uploadFile(
          image.originalname,
          image.buffer,
          image.mimetype,
          'organization',
        );
      }

      const data = {
        ...dto,
        image: imageUrl,
        createdBy: { id: req.user.id },
      };
      const created = await this.organizationService.save(data);
      return commonResponse.success(
        languageCode,
        res,
        'ORGANIZATION_ADD',
        200,
        created,
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

  @Get('/organizationList')
  @ApiSecurity('jwt-auth')
  @Roles(ROLES.ADMIN, ROLES.TRAINER, ROLES.LEARNER)
  @UseGuards(JwtAuthGuard, RoleGuard)
  async getAllOrganizations(
    @Query() query: PaginatedQueryDto,
    @Req() req,
    @Res() res,
  ) {
    let languageCode = req.headers.languagecode || LANGUAGE_CODE.EN;
    try {
      const organizationList =
        await this.organizationService.findAllOrganization(query);
      if (organizationList) {
        return commonResponse.paginationResponse(
          languageCode,
          res,
          'ORGANIZATION_LIST',
          200,
          organizationList,
        );
      } else {
        let data = {
          totalCount: 0,
          totalPages: 0,
          currentPage: 0,
          list: [],
        };
        return commonResponse.paginationResponse(
          languageCode,
          res,
          'NO_DATA_FOUND',
          200,
          data,
        );
      }
    } catch (error) {
      console.error('AdminController getAllUsers error', error);
      return commonResponse.error(
        languageCode,
        res,
        'DEFAULT_INTERNAL_SERVER_ERROR',
        500,
        {},
      );
    }
  }

  @Get('/assignOrganizationList')
  @ApiSecurity('jwt-auth')
  @Roles(ROLES.ADMIN, ROLES.TRAINER, ROLES.LEARNER)
  @UseGuards(JwtAuthGuard, RoleGuard)
  async assignListByOrganization(
    @Query() query: AssigneByOrganizationDto,
    @Req() req,
    @Res() res,
  ) {
    const languageCode = req.headers.languagecode || LANGUAGE_CODE.EN;
    try {
      const assigneeTrackers = await this.assigneeTrackerService.findAll({
        course: query.courseId,
        deleted: false,
      });

      const organizationEntities = await this.organizationService.findAll({
        deleted: false,
      });
      const organizationIds = organizationEntities.map((org) => org.id); // <-- Convert to string[]
      const assignedOrgs =
        await this.organizationService.getAssignedOrganization(
          organizationIds,
          query,
        );

      return commonResponse.paginationResponse(
        languageCode,
        res,
        'ASSIGNED_COURSE_LIST',
        200,
        assignedOrgs,
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

  @Get('/unassignOrganizationList')
  @ApiSecurity('jwt-auth')
  @Roles(ROLES.ADMIN, ROLES.TRAINER, ROLES.LEARNER)
  @UseGuards(JwtAuthGuard, RoleGuard)
  async unassignOrganizationList(
    @Query() query: AssigneByOrganizationDto,
    @Req() req,
    @Res() res,
  ) {
    const languageCode = req.headers.languagecode || LANGUAGE_CODE.EN;
    try {
      const assigneeTrackers = await this.assigneeTrackerService.findAll({
        course: query.courseId,
        deleted: false,
      });

      const organizationEntities = await this.organizationService.findAll({
        deleted: false,
      });
      const organizationIds = organizationEntities.map((org) => org.id); // <-- Convert to string[]
      const unassignedOrgs =
        await this.organizationService.getUnassignedOrganization(
          organizationIds,
          query,
        );

      return commonResponse.paginationResponse(
        languageCode,
        res,
        'UNASSIGNED_COURSE_LIST',
        200,
        unassignedOrgs,
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

  @Put('/assignOrganization/:id')
  @ApiSecurity('jwt-auth')
  @Roles(ROLES.ADMIN)
  @UseGuards(JwtAuthGuard, RoleGuard)
  async assignOrganizationToCourse(
    @Param('id') courseId: string,
    @Body() body: AssignCourseToOrganizationDto,
    @Req() req,
    @Res() res,
  ) {
    const languageCode = req.headers.languagecode || LANGUAGE_CODE.EN;
    try {
      const orgExists = await this.organizationService.findByQuery({
        id: courseId,
        deleted: false,
      });
      if (!orgExists) {
        return commonResponse.error(
          languageCode,
          res,
          'ORGANIZATION_NOT_FOUND',
          400,
          {},
        );
      }

      await this.assigneeTrackerService.assignOrganization(
        courseId,
        body.assignedTo,
      );

      return commonResponse.success(
        languageCode,
        res,
        'ORGANIZATION_ASSIGNEE_SUCCESSFULL',
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

  @Get(':id')
  @ApiSecurity('jwt-auth')
  @Roles(ROLES.ADMIN, ROLES.TRAINER, ROLES.LEARNER)
  @UseGuards(JwtAuthGuard, RoleGuard)
  async findOrganization(@Param('id') id: string, @Req() req, @Res() res) {
    const languageCode = req.headers.languagecode || LANGUAGE_CODE.EN;
    try {
      const organization = await this.organizationService.findOne({
        id,
        deleted: false,
      });
      if (!organization)
        return commonResponse.error(
          languageCode,
          res,
          'ORGANIZATION_NOT_FOUND',
          400,
          {},
        );

      if (organization.image) {
        organization.image = `${process.env.IMAGE_HOST_URL}${organization.image}`;
      }

      const [learnerCount, trainerCount, courseCount] = await Promise.all([
        this.usersService.userCounts({
          where: {
            organization: { id: id },
            role: ROLES.LEARNER,
            deleted: false,
          },
        }),
        this.usersService.userCounts({
          where: {
            organization: { id: id },
            role: ROLES.TRAINER,
            deleted: false,
          },
        }),
        this.assigneeTrackerService.count({
          where: {
            organization: { id: id },
            deleted: false,
          },
        }),
      ]);

      return commonResponse.success(
        languageCode,
        res,
        'ORGANIZATION_DETAIL_FOUND',
        200,
        {
          ...organization,
          learnerCount,
          trainerCount,
          courseCount,
        },
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
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: OrganizationUpdateDto })
  @Roles(ROLES.ADMIN)
  @UseGuards(JwtAuthGuard, RoleGuard)
  async updateOrganization(
    @Param('id') id: string,
    @Body() dto: OrganizationUpdateDto,
    @UploadedFile() image,
    @Req() req,
    @Res() res,
  ) {
    const languageCode = req.headers.languagecode || LANGUAGE_CODE.EN;
    try {
      const organization = await this.organizationService.findOne({
        id,
        deleted: false,
      });
      if (!organization)
        return commonResponse.error(
          languageCode,
          res,
          'ORGANIZATION_NOT_FOUND',
          400,
          {},
        );

      if (organization.image && image) {
        await this.awsS3.deleteImageFromS3(organization.image);
      }

      let imageUrl = organization.image;
      if (image) {
        imageUrl = await this.awsS3.uploadFile(
          image.originalname,
          image.buffer,
          image.mimetype,
          'organization',
        );
      }

      let videoWatchLimit = 0;
      if (dto.videoWatchLimit) {
        videoWatchLimit = dto.videoWatchLimit;
      }
      const updateData = {
        ...dto,
        image: imageUrl,
        updatedBy: { id: req.user.id },
        videoWatchLimit,
      };
      const updated = await this.organizationService.updateById(id, updateData);
      return commonResponse.success(
        languageCode,
        res,
        'ORGANIZATION_UPDATE',
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
  async deleteOrganization(@Param('id') id: string, @Req() req, @Res() res) {
    const languageCode = req.headers.languagecode || LANGUAGE_CODE.EN;
    try {
      const organization = await this.organizationService.findOne({
        id,
        deleted: false,
      });
      if (!organization)
        return commonResponse.error(
          languageCode,
          res,
          'ORGANIZATION_NOT_FOUND',
          400,
          {},
        );

      await this.organizationService.updateById(id, {
        deleted: true,
        deletedAt: moment.utc().toDate(),
        deletedBy: { id: req.user.id },
      });
      return commonResponse.success(
        languageCode,
        res,
        'ORGANIZATION_DELETED',
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
