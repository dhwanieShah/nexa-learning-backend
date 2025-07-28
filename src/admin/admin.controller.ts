// File: admin.controller.ts (updated for TypeORM and enum casting)

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
import { ApiConsumes, ApiHeader, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { commonFunctions, commonResponse } from 'helper';
import * as moment from 'moment';
import {
  Roles as UserRole,
  Status,
  User,
} from 'src/auth/entities/users.entity';
import { LANGUAGE_CODE, ROLES, STATUS } from 'src/utils/constants';
import { Not, Repository } from 'typeorm';
import { UploadFile } from '../../helper/aws.helper';
import { JwtAuthGuard } from '../auth/role/jwt-auth.guard';
import { RoleGuard } from '../auth/role/role.guard';
import { Roles } from '../auth/role/roles.decorator';
import { MailService } from '../mail/mail.service';
import { CreateUserDto } from './dto/create-users.dto';
import { CreateRoleBaseUserDto } from './dto/createRoleBaseUser.dto';
import { PaginatedQueryDto } from './dto/pagination-query.dto';
import { SearchLocalGatewayRoutesRequest } from 'aws-sdk/clients/ec2';
import { AdminService } from './admin.service';
import { AssigneeTrackerService } from 'src/assigneeTracker/assigneeTracker.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateUserDto } from './dto/update-users.dto';

@Controller('admin')
@ApiTags('Admin')
@ApiHeader({
  name: 'languagecode',
  description: 'Add Language Code From "en" or "fr"',
})
export class AdminController {
  constructor(
    private AdminService: AdminService,
    private mailService: MailService,
    private awsS3: UploadFile,
    private assigneeTrackerService: AssigneeTrackerService,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  @Post('/createAdmin')
  @UseInterceptors(FileInterceptor('profilePic'))
  @ApiConsumes('multipart/form-data')
  async createAdmin(
    @Body() CreateUserDto: CreateRoleBaseUserDto,
    @UploadedFile() profilePic,
    @Req() req,
    @Res() res,
  ) {
    let languageCode = req.headers.languagecode || LANGUAGE_CODE.EN;
    try {
      const checkEmail = await this.userRepository.findOneBy({
        email: CreateUserDto.email,
        deleted: false,
      });
      if (checkEmail) {
        return commonResponse.error(languageCode, res, 'EMAIL_EXIST', 409, {});
      }

      const hashed = await bcrypt.hash(CreateUserDto.password, 10);
      let imageUrl;

      if (profilePic) {
        imageUrl = await this.awsS3.uploadFile(
          profilePic.originalname,
          profilePic.buffer,
          profilePic.mimetype,
          'user',
        );
      }

      const user = await this.userRepository.save({
        ...CreateUserDto,
        role: CreateUserDto.role as UserRole,
        profilePic: imageUrl,
        password: hashed,
        name: CreateUserDto.firstName + ' ' + CreateUserDto.lastName,
        status: STATUS.VERIFIED as Status,
      });

      if (user) {
        return commonResponse.success(
          languageCode,
          res,
          'USER_CREATED',
          200,
          user,
        );
      } else {
        return commonResponse.customResponse(
          languageCode,
          res,
          'SERVER_ERROR',
          400,
          {},
        );
      }
    } catch (error: any) {
      console.error('AdminController createAdmin error', error);
      return commonResponse.error(
        languageCode,
        res,
        'DEFAULT_INTERNAL_SERVER_ERROR',
        500,
        {},
      );
    }
  }

  @Post('/createUser')
  @ApiSecurity('jwt-auth')
  @UseInterceptors(FileInterceptor('profilePic'))
  @ApiConsumes('multipart/form-data')
  @Roles(ROLES.ADMIN, ROLES.TRAINER)
  @UseGuards(JwtAuthGuard, RoleGuard)
  async createUser(
    @Body() createUserDto: CreateUserDto,
    @UploadedFile() profilePic,
    @Req() req,
    @Res() res,
  ) {
    const languageCode = req.headers.languagecode || LANGUAGE_CODE.EN;
    try {
      const existing = await this.userRepository.findOneBy({
        email: createUserDto.email,
      });
      if (existing) {
        return commonResponse.error(languageCode, res, 'EMAIL_EXIST', 409, {});
      }

      const generatedPassword = await commonFunctions.generatePassword();
      const hashed = await bcrypt.hash(generatedPassword, 10);
      let imageUrl;

      if (profilePic) {
        imageUrl = await this.awsS3.uploadFile(
          profilePic.originalname,
          profilePic.buffer,
          profilePic.mimetype,
          'user',
        );
      }

      const createdBy = req.user.id;
      const createdByUser = await this.userRepository.findOne({
        where: { id: createdBy },
      });

      if (
        createdByUser.role === ROLES.TRAINER &&
        createUserDto.role === ROLES.TRAINER
      ) {
        return commonResponse.customResponse(
          languageCode,
          res,
          'NOT_ALLOW_TO_ADD_TRAINER',
          400,
          {},
        );
      }

      let organizationId;
      if (createdByUser.role === ROLES.ADMIN) {
        if (!createUserDto.organization) {
          return commonResponse.customResponse(
            languageCode,
            res,
            'ORGANIZATION_REQUIRE',
            400,
            {},
          );
        }
        organizationId = createUserDto.organization;
      } else {
        organizationId = createdByUser.organization?.id;
      }

      const user = await this.userRepository.save({
        ...createUserDto,
        name: createUserDto.firstName + ' ' + createUserDto.lastName,
        profilePic: imageUrl,
        password: hashed,
        organization: { id: organizationId },
        createdBy: { id: createdBy },
        status: STATUS.VERIFIED as Status,
        role: createUserDto.role as UserRole,
      });

      const template =
        createUserDto.role === ROLES.LEARNER
          ? languageCode === LANGUAGE_CODE.EN
            ? 'learnerEmailTemplateEn.hbs'
            : 'learnerEmailTemplateFr.hbs'
          : languageCode === LANGUAGE_CODE.EN
            ? 'trainerEmailTemplateEn.hbs'
            : 'trainerEmailTemplateFr.hbs';

      const subject =
        createUserDto.role === ROLES.LEARNER
          ? languageCode === LANGUAGE_CODE.EN
            ? 'Welcome to your Nexa VR training platform'
            : 'Bienvenue sur votre plateforme de formation Nexa VR'
          : languageCode === LANGUAGE_CODE.EN
            ? 'Welcome to your Nexa VR platform'
            : 'Bienvenue sur votre plateforme Nexa VR';

      await this.mailService.sendMail({
        to: createUserDto.email,
        from: process.env.SMTP_AUTH_USER,
        subject,
        template,
        context: {
          firstName: createUserDto.firstName,
          email: createUserDto.email,
          password: generatedPassword,
          platformLink: process.env.PLATEFORM_LINK,
        },
      });

      return commonResponse.success(
        languageCode,
        res,
        'USER_CREATED',
        200,
        user,
      );
    } catch (error: any) {
      console.error('AdminController createUser error', error);
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
  @Roles(ROLES.ADMIN, ROLES.TRAINER)
  @UseGuards(JwtAuthGuard, RoleGuard)
  async deleteUser(@Param('id') id: string, @Req() req, @Res() res) {
    const languageCode = req.headers.languagecode || LANGUAGE_CODE.EN;
    try {
      const user = await this.userRepository.findOne({
        where: { id, deleted: false },
        relations: ['organization'],
      });
      if (!user) {
        return commonResponse.error(
          languageCode,
          res,
          'USER_DETAIL_NOT_FOUND',
          400,
          {},
        );
      }

      const currentUser = await this.userRepository.findOne({
        where: { id: req.user.id },
      });
      if (currentUser.role === ROLES.TRAINER && user.role === ROLES.TRAINER) {
        return commonResponse.error(
          languageCode,
          res,
          'NOT_ALLOW_TO_DELETE_TRAINER',
          400,
          {},
        );
      }

      user.deleted = true;
      user.deletedAt = moment.utc().toDate();
      user.deletedBy = req.user.id;

      await this.userRepository.save(user);
      return commonResponse.success(languageCode, res, 'USER_DELETE', 200, {});
    } catch (error) {
      console.error('AdminController deleteUser error', error);
      return commonResponse.error(
        languageCode,
        res,
        'DEFAULT_INTERNAL_SERVER_ERROR',
        500,
        {},
      );
    }
  }

  @Get('/getAllUsers')
  @ApiSecurity('jwt-auth')
  @Roles(ROLES.ADMIN)
  @UseGuards(JwtAuthGuard, RoleGuard)
  async getAllUsers(@Query() query: PaginatedQueryDto, @Req() req, @Res() res) {
    let languageCode = req.headers.languagecode || LANGUAGE_CODE.EN;
    try {
      const page = req.page ? parseInt(req.page) : 1;
      const limit = req.limit ? parseInt(req.limit) : 10;
      const skip = (page - 1) * limit;
      const whereClause: any = {
        role: Not('admin'),
        deleted: Not(true),
      };
      const [list, total] = await this.userRepository.findAndCount({
        where: whereClause,
        take: limit,
        skip: skip,
        relations: ['organization'],
        order: { createdAt: 'DESC' },
      });

      const usersWithProfilePic = [];

      for (const user of list) {
        if (user.profilePic && user.profilePic !== '') {
          user.profilePic =
            `${process.env.IMAGE_HOST_URL}${user.profilePic}` || '';
        }

        const courseCount = await this.assigneeTrackerService.count({
          where: {
            organization: { id: user.organization.id },
            deleted: false,
          },
        });
        console.log(
          'OrganizationService  organizations.map  courseCount',
          courseCount,
        );

        const userWithCourseCount = { ...user, courseCount: courseCount };
        usersWithProfilePic.push(userWithCourseCount);
      }

      const result = {
        totalCount: total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        list: usersWithProfilePic,
      };
      return commonResponse.paginationResponse(
        languageCode,
        res,
        'USER_LIST',
        200,
        result,
      );
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

  /*
   *   Find Users By Id
   */
  @Get(':id')
  @ApiSecurity('jwt-auth')
  @Roles(ROLES.ADMIN)
  @UseGuards(JwtAuthGuard, RoleGuard)
  async findUser(@Param('id') id: string, @Req() req, @Res() res) {
    let languageCode = req.headers.languagecode || LANGUAGE_CODE.EN;

    try {
      // UUID or integer format depending on your database id type
      const isValidId = !isNaN(Number(id)) || /^[0-9a-fA-F-]{36}$/.test(id);
      if (!isValidId) {
        return commonResponse.error(
          languageCode,
          res,
          'PLEASE_ENTER_CORRECT_ID',
          400,
          {},
        );
      }

      const resUser = await this.AdminService.findById(id);
      if (!resUser) {
        return commonResponse.customResponse(
          languageCode,
          res,
          'USER_NOT_FOUND',
          400,
          {},
        );
      }

      let image;
      if (resUser.profilePic && resUser.profilePic !== '') {
        image = `${process.env.IMAGE_HOST_URL}${resUser.profilePic}`;
      }
      resUser.profilePic = image;

      const courseCount = await this.assigneeTrackerService.count({
        where: {
          organization: { id: resUser.organization.id },
          deleted: false,
        },
      });

      const response = {
        ...resUser,
        courseCount,
      };

      return commonResponse.success(
        languageCode,
        res,
        'USER_DETAIL_FOUND',
        200,
        response,
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

  /*
   *   Update User
   */
  @Put(':id')
  @ApiSecurity('jwt-auth')
  @Roles(ROLES.ADMIN)
  @UseGuards(JwtAuthGuard, RoleGuard)
  async updateProfile(
    @Param('id') id: string,
    @Body() body: UpdateProfileDto,
    @Req() req,
    @Res() res,
  ) {
    let languageCode = req.headers.languagecode || LANGUAGE_CODE.EN;

    try {
      const user = await this.AdminService.findByQuery({
        where: { id, deleted: false },
      });

      if (!user) {
        return commonResponse.error(
          languageCode,
          res,
          'USER_NOT_FOUND',
          400,
          {},
        );
      }

      const updateUser = await this.AdminService.updateById(id, body);
      if (updateUser) {
        return commonResponse.success(
          languageCode,
          res,
          'USER_PROFILE_UPDATE',
          200,
          updateUser,
        );
      }
    } catch (error: any) {
      console.log('AdminService updateById error', error);
      return commonResponse.error(
        languageCode,
        res,
        'DEFAULT_INTERNAL_SERVER_ERROR',
        500,
        {},
      );
    }
  }
  /*
   *   Update User
   */
  @Put('updateUser/:id')
  @ApiSecurity('jwt-auth')
  @UseInterceptors(FileInterceptor('profilePic'))
  @ApiConsumes('multipart/form-data')
  // @UseGuards(AuthGuard())
  @Roles(ROLES.ADMIN, ROLES.TRAINER)
  @UseGuards(JwtAuthGuard, RoleGuard)
  async updateUser(
    @Param('id') id: string,
    @Body() body: UpdateUserDto,
    @UploadedFile() profilePic,
    @Req() req,
    @Res() res,
  ) {
    let languageCode = req.headers.languagecode || LANGUAGE_CODE.EN;

    try {
      const user = await this.AdminService.findByQuery({ id, deleted: false });
      console.log('🚀 ~ AdminController ~ user:', user);

      if (!user) {
        return commonResponse.error(
          languageCode,
          res,
          'USER_NOT_FOUND',
          400,
          {},
        );
      }

      if (
        user.profilePic &&
        profilePic &&
        body.profilePic !== '' &&
        body.profilePic !== undefined
      ) {
        await this.awsS3.deleteImageFromS3(user.profilePic);
      }

      let uploadedProfilePicUrl = user.profilePic;
      if (profilePic) {
        uploadedProfilePicUrl = await this.awsS3.uploadFile(
          profilePic.originalname,
          profilePic.buffer,
          profilePic.mimetype,
          'user',
        );
      }

      const updatedById = req.user.id;
      const userData = await this.AdminService.findById(updatedById);

      if (userData?.role === ROLES.TRAINER && user.role === ROLES.TRAINER) {
        return commonResponse.error(
          languageCode,
          res,
          'NOT_ALLOW_TO_UPDATE_TRAINER',
          400,
          {},
        );
      }

      let organizationID = user.organization?.id;

      if (userData?.role === ROLES.ADMIN && body.organization) {
        organizationID = body.organization;
      } else if (userData?.role === ROLES.TRAINER) {
        organizationID = userData.organization?.id;
      }

      const updateUserPayload: any = {
        firstName: body.firstName,
        lastName: body.lastName,
        profilePic: uploadedProfilePicUrl,
        name: body.name,
        position: body.position,
        organization: organizationID,
        updatedBy: updatedById,
      };

      const updateUser = await this.AdminService.updateById(
        id,
        updateUserPayload,
      );

      if (updateUser) {
        return commonResponse.success(
          languageCode,
          res,
          'USER_PROFILE_UPDATE',
          200,
          updateUser,
        );
      }
    } catch (error) {
      console.log('AdminController  error', error);
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
