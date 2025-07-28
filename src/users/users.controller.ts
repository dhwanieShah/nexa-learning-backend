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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiSecurity, ApiTags, ApiHeader, ApiResponse } from '@nestjs/swagger';
import { UpdateUserDto } from './dto/update-users.dto';
import { AuthGuard } from '@nestjs/passport';
import { emailVerificationDto } from './dto/emailVerification.dto';
import { JwtAuthGuard } from '../auth/role/jwt-auth.guard';
import { RoleGuard } from '../auth/role/role.guard';
import { Roles } from '../auth/role/roles.decorator';
import { LANGUAGE_CODE, ROLES, STATUS } from 'src/utils/constants';
import { PaginatedQueryDto } from './dto/pagination-query.dto';
import { commonResponse } from 'helper';
import * as moment from 'moment';
import { isUUID } from 'class-validator';

@Controller('users')
@ApiTags('User')
@ApiHeader({
  name: 'languagecode',
  description: 'Add Language Code From "en" or "fr"',
})
export class UsersController {
  constructor(private usersService: UsersService) {}

  @ApiResponse({
    status: 200,
    description: 'User list fetched successfully.',
    schema: {
      example: {
        status: true,
        message: 'User list fetched successfully.',
        totalCount: 2,
        totalPages: 1,
        currentPage: 1,
        data: [
          {
            id: 'f3f742c9-37b9-493e-8b4c-9183743f082b',
            firstName: 'John',
            lastName: 'Doe',
            name: null,
            profilePic: '',
            email: 'john@mailinator.com',
            password:
              '$2b$10$czWdm/HNo2JDhMiIKbu5k.xNc5NF.wX4u4eID3QIjdNQ4by.sR49S',
            role: 'learner',
            otp: null,
            status: null,
            position: 'string',
            fcmToken: null,
            deviceType: null,
            deviceId: null,
            deviceName: null,
            loginTime: null,
            googleId: null,
            appleId: null,
            facebookId: null,
            loginType: 'normal',
            isFirstTimeLogin: true,
            logoutTime: null,
            deleted: false,
            createdAt: '2025-07-10T06:15:02.657Z',
            updatedAt: '2025-07-10T06:15:02.657Z',
            deletedAt: null,
            location: '',
          },
        ],
      },
    },
  })
  @Get('/getAll')
  @ApiSecurity('jwt-auth')
  @Roles(ROLES.ADMIN, ROLES.TRAINER, ROLES.LEARNER)
  @UseGuards(JwtAuthGuard, RoleGuard)
  async getAllUsers(@Query() query: PaginatedQueryDto, @Req() req, @Res() res) {
    let languageCode = req.headers.languagecode || LANGUAGE_CODE.EN;
    try {
      let userList = await this.usersService.findAllUsers(query);
      if (userList) {
        return commonResponse.paginationResponse(
          languageCode,
          res,
          'USER_LIST',
          200,
          userList,
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
    } catch (error: any) {
      return commonResponse.error(
        languageCode,
        res,
        'DEFAULT_INTERNAL_SERVER_ERROR',
        500,
        {},
      );
    }
  }

  @ApiResponse({
    status: 200,
    description: 'User details response',
    schema: {
      example: {
        status: true,
        message: 'User detail fetch successfully.',
        data: {
          id: 'f3f742c9-37b9-493e-8b4c-9183743f082b',
          firstName: 'John',
          lastName: 'Doe',
          name: null,
          profilePic: '',
          email: 'john@mailinator.com',
          password:
            '$2b$10$czWdm/HNo2JDhMiIKbu5k.xNc5NF.wX4u4eID3QIjdNQ4by.sR49S',
          role: 'learner',
          otp: null,
          status: null,
          position: 'string',
          fcmToken: null,
          deviceType: null,
          deviceId: null,
          deviceName: null,
          loginTime: null,
          googleId: null,
          appleId: null,
          facebookId: null,
          loginType: 'normal',
          isFirstTimeLogin: true,
          logoutTime: null,
          deleted: false,
          createdAt: '2025-07-10T06:15:02.657Z',
          updatedAt: '2025-07-10T06:15:02.657Z',
          deletedAt: null,
          location: '',
        },
      },
    },
  })
  @Get(':id')
  @ApiSecurity('jwt-auth')
  @Roles(ROLES.ADMIN, ROLES.TRAINER, ROLES.LEARNER)
  @UseGuards(JwtAuthGuard, RoleGuard)
  async findUser(@Param('id') id: string, @Req() req, @Res() res) {
    let languageCode = req.headers.languagecode || LANGUAGE_CODE.EN;
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
      const resUser = await this.usersService.findById(id);
      if (!resUser) {
        return commonResponse.customResponse(
          languageCode,
          res,
          'USER_NOT_FOUND',
          400,
          {},
        );
      }
      return commonResponse.success(
        languageCode,
        res,
        'USER_DETAIL_FOUND',
        200,
        resUser,
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

  @ApiResponse({
    status: 200,
    description: 'User profile update response',
    schema: {
      example: {
        status: true,
        message: 'Your Profile Updated successfully.',
        data: {
          id: 'f3f742c9-37b9-493e-8b4c-9183743f082b',
          firstName: 'Test',
          lastName: 'test',
          name: 'testingg',
          profilePic: '',
          email: 'john@mailinator.com',
          password:
            '$2b$10$czWdm/HNo2JDhMiIKbu5k.xNc5NF.wX4u4eID3QIjdNQ4by.sR49S',
          role: 'learner',
          otp: null,
          status: null,
          position: 'string',
          fcmToken: null,
          deviceType: null,
          deviceId: null,
          deviceName: null,
          loginTime: null,
          googleId: null,
          appleId: null,
          facebookId: null,
          loginType: 'normal',
          isFirstTimeLogin: true,
          logoutTime: null,
          deleted: false,
          createdAt: '2025-07-10T06:15:02.657Z',
          updatedAt: '2025-07-11T06:47:43.618Z',
          deletedAt: null,
          location: 'ahmedabad',
        },
      },
    },
  })
  @Put(':id')
  @ApiSecurity('jwt-auth')
  @Roles(ROLES.ADMIN, ROLES.TRAINER, ROLES.LEARNER)
  @UseGuards(JwtAuthGuard, RoleGuard)
  async updateUser(
    @Param('id') id: string,
    @Body() body: UpdateUserDto,
    @Req() req,
    @Res() res,
  ) {
    let languageCode = req.headers.languagecode || LANGUAGE_CODE.EN;
    try {
      const user = await this.usersService.findById(id);
      if (!user) {
        return commonResponse.error(
          languageCode,
          res,
          'USER_NOT_FOUND',
          400,
          {},
        );
      }
      console.log('🚀 ~ UsersController ~  req.user.id:', req.user.id);

      let updateUserPayload = {
        ...body,
        updatedBy: { id: req.user.id },
      };
      console.log(
        '🚀 ~ UsersController ~ updateUserPayload:',
        updateUserPayload,
      );

      let updateUser = await this.usersService.updateById(
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
    } catch (error: any) {
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
  @Roles(ROLES.ADMIN, ROLES.TRAINER, ROLES.LEARNER)
  @UseGuards(JwtAuthGuard, RoleGuard)
  async deleteUser(@Param('id') id: string, @Req() req, @Res() res) {
    let languageCode = req.headers.languagecode || LANGUAGE_CODE.EN;
    try {
      let user = await this.usersService.findByQuery({ id, deleted: false });
      if (!user) {
        return commonResponse.error(
          languageCode,
          res,
          'USER_DETAIL_NOT_FOUND',
          400,
          {},
        );
      }

      let data = {
        deleted: true,
        deletedAt: moment.utc().toDate(),
        deletedBy: { id: req.user.id },
      };

      let deleteData = await this.usersService.deleteById(id, data);
      if (deleteData) {
        return commonResponse.success(
          languageCode,
          res,
          'USER_DELETE',
          200,
          {},
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
      console.log('🚀 ~ UsersController ~ deleteUser ~ error:', error);
      return commonResponse.error(
        languageCode,
        res,
        'DEFAULT_INTERNAL_SERVER_ERROR',
        500,
        {},
      );
    }
  }

  @Post('/verifyOtp')
  async emailVerification(
    @Body() emailVerificationDto: emailVerificationDto,
    @Req() req,
    @Res() res,
  ) {
    let languageCode = req.headers.languagecode || LANGUAGE_CODE.EN;
    try {
      const { userId, otp } = emailVerificationDto;
      const user = await this.usersService.findByQuery({
        id: userId,
        deleted: false,
      });

      if (!user) {
        return commonResponse.customResponse(
          languageCode,
          res,
          'USER_NOT_FOUND',
          400,
          {},
        );
      }

      if (user.otp === 0 || user.otp != otp) {
        return commonResponse.error(languageCode, res, 'INVALID_OTP', 400, {});
      }

      let updateData = {
        status: STATUS.VERIFIED,
        otp: 0,
      };

      await this.usersService.updateById(userId, updateData);

      const updatedUser = await this.usersService.findById(user.id);
      if (!updatedUser) {
        return commonResponse.customResponse(
          languageCode,
          res,
          'USER_NOT_FOUND',
          400,
          {},
        );
      }
      return commonResponse.success(
        languageCode,
        res,
        'USER_PROFILE_UPDATE',
        200,
        updatedUser,
      );
    } catch (error: any) {
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
