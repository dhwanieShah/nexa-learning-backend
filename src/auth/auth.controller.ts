// auth.controller.ts (TypeORM + PostgreSQL version)
import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiHeader, ApiSecurity, ApiTags } from '@nestjs/swagger';
import * as bcrypt from 'bcryptjs';
import { commonResponse } from 'helper';
import * as moment from 'moment';
import { LANGUAGE_CODE, ROLES, STATUS } from 'src/utils/constants';
import { MailService } from '../mail/mail.service';
import { AuthService } from './auth.service';
import { ForgotPasswordDto } from './dto/forgotPassword.dto';
import { ForgotPasswordVerificationDto } from './dto/forgotpasswordVerification.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/resetPassword.dto';
import { JwtAuthGuard } from './role/jwt-auth.guard';
import { RoleGuard } from './role/role.guard';
import { Roles } from './role/roles.decorator';

@Controller('auth')
@ApiTags('Auth')
@ApiHeader({
  name: 'languagecode',
  description: 'Add Language Code From "en" or "fr"',
})
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  @Post('/login')
  async login(@Body() loginDto: LoginDto, @Req() req, @Res() res) {
    console.log('🚀 ~ AuthController ~ login ~ loginDto:', loginDto);
    const languageCode = req.headers.languagecode || LANGUAGE_CODE.EN;
    console.log('🚀 ~ AuthController ~ login ~ languageCode:', languageCode);
    try {
      const user = await this.authService.customFind({ email: loginDto.email });
      if (!user)
        return commonResponse.error(languageCode, res, 'USER_NOT_FOUND', 400);
      console.log('🚀 ~ AuthController ~ login ~ user:', user);

      if (
        [
          STATUS.PENDING,
          STATUS.DEACTIVATED,
          STATUS.BLOCKED,
          STATUS.REJECTED,
        ].includes(user.status)
      ) {
        return commonResponse.error(
          languageCode,
          res,
          `USER_${user.status}`,
          400,
        );
      }

      const isPasswordMatched = await bcrypt.compare(
        loginDto.password,
        user.password,
      );
      if (!isPasswordMatched)
        return commonResponse.error(
          languageCode,
          res,
          'INVALID_EMAIL_PASSWORD',
          400,
        );

      Object.assign(user, {
        fcmToken: req.body.fcmToken || '',
        deviceType: req.body.deviceType || '',
        deviceId: req.body.deviceId || '',
        deviceName: req.body.deviceName || '',
        loginTime: moment.utc().toDate(),
        isFirstTimeLogin: false,
        logoutTime: null,
      });
      await this.authService.save(user);

      const token = this.jwtService.sign(
        {
          id: user.id,
          role: user.role,
          organization: user.organization?.id,
        },
        { expiresIn: '30d' },
      );

      const response = {
        ...user,
        profilePic: user.profilePic
          ? process.env.IMAGE_HOST_URL + user.profilePic
          : '',
        organization: user.organization
          ? {
              ...user.organization,
              image: user.organization.image
                ? process.env.IMAGE_HOST_URL + user.organization.image
                : '',
            }
          : null,
        token,
      };

      return commonResponse.success(
        languageCode,
        res,
        'LOGIN_SUCCESS',
        200,
        response,
      );
    } catch (err) {
      console.log('🚀 ~ AuthController ~ login ~ err:', err);
      return commonResponse.error(
        languageCode,
        res,
        'DEFAULT_INTERNAL_SERVER_ERROR',
        500,
      );
    }
  }

  @Post('/logout')
  @ApiSecurity('jwt-auth')
  @Roles(ROLES.ADMIN, ROLES.TRAINER, ROLES.LEARNER)
  @UseGuards(JwtAuthGuard, RoleGuard)
  async logout(@Req() req, @Res() res) {
    const languageCode = req.headers.languagecode || LANGUAGE_CODE.EN;
    try {
      const user = await this.authService.findById(req.user.id);
      Object.assign(user, {
        fcmToken: '',
        deviceId: '',
        deviceType: '',
        deviceName: '',
        logoutTime: moment.utc().toDate(),
      });
      await this.authService.save(user);
      return commonResponse.success(languageCode, res, 'USER_LOGOUT', 200);
    } catch (err) {
      return commonResponse.error(
        languageCode,
        res,
        'DEFAULT_INTERNAL_SERVER_ERROR',
        500,
      );
    }
  }

  @Post('/forgotPassword')
  async forgotPassword(@Body() dto: ForgotPasswordDto, @Req() req, @Res() res) {
    const languageCode = req.headers.languagecode || LANGUAGE_CODE.EN;
    try {
      const user = await this.authService.findByQuery({ email: dto.email });
      if (!user)
        return commonResponse.error(languageCode, res, 'EMAIL_NOT_EXIST', 500);
      if (user.status === STATUS.DEACTIVATED)
        return commonResponse.error(languageCode, res, 'USER_DEACTIVATED', 400);

      user.otp = Math.floor(1000 + Math.random() * 9000);
      await this.authService.save(user);

      await this.mailService.sendMail({
        to: user.email,
        from: process.env.SMTP_AUTH_USER,
        subject: 'Forgot Password OTP',
        template: 'register.hbs',
        context: { email: user.email, otp: user.otp },
      });

      return commonResponse.success(
        languageCode,
        res,
        'FORGOT_PASSWORD_SUCCESS',
        200,
        user,
      );
    } catch (err) {
      return commonResponse.error(
        languageCode,
        res,
        'DEFAULT_INTERNAL_SERVER_ERROR',
        500,
      );
    }
  }

  @Post('/forgotPasswordVerification')
  async forgotPasswordVerification(
    @Body() dto: ForgotPasswordVerificationDto,
    @Req() req,
    @Res() res,
  ) {
    const languageCode = req.headers.languagecode || LANGUAGE_CODE.EN;
    try {
      const user = await this.authService.findById(dto.userId);
      if (!user || user.status === STATUS.DEACTIVATED)
        return commonResponse.error(languageCode, res, 'USER_DEACTIVATED', 400);

      if (!dto.otp || dto.otp !== user.otp)
        return commonResponse.error(languageCode, res, 'INVALID_OTP', 400);

      user.otp = 0;
      await this.authService.save(user);
      return commonResponse.success(languageCode, res, 'USER_VERIFIED', 200);
    } catch (err) {
      return commonResponse.error(
        languageCode,
        res,
        'DEFAULT_INTERNAL_SERVER_ERROR',
        500,
      );
    }
  }

  @Post('/resetPassword')
  async resetPassword(@Body() dto: ResetPasswordDto, @Req() req, @Res() res) {
    const languageCode = req.headers.languagecode || LANGUAGE_CODE.EN;
    try {
      const user = await this.authService.findById(dto.userId);
      if (!user)
        return commonResponse.error(languageCode, res, 'USER_NOT_FOUND', 500);
      if ([STATUS.PENDING, STATUS.DEACTIVATED].includes(user.status))
        return commonResponse.error(
          languageCode,
          res,
          `USER_${user.status}`,
          400,
        );

      user.password = await bcrypt.hash(dto.password, 10);
      await this.authService.save(user);
      return commonResponse.success(
        languageCode,
        res,
        'PASSWORD_RESET_SUCCESS',
        200,
      );
    } catch (err) {
      return commonResponse.error(
        languageCode,
        res,
        'DEFAULT_INTERNAL_SERVER_ERROR',
        500,
      );
    }
  }
}
