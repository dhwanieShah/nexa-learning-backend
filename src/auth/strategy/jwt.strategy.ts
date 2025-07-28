import { Injectable, UnauthorizedException, Req, Res } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { LANGUAGE_CODE } from 'src/utils/constants';
import { commonResponse } from 'helper';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload, @Req() req, @Res() res) {
    console.log('JwtStrategy  validate  payload', payload);
    // console.log('JwtStrategy  validate  req.headers', req.headers);
    let languageCode = req?.headers?.languagecode || LANGUAGE_CODE.EN;

    const { id } = payload;
    const user = await this.userService.findById(id);

    if (!user) {
      // throw new UnauthorizedException('Login first to access this endpoint.');
      commonResponse.unAuthentication(
        languageCode,
        res,
        'SESSION_EXPIRED',
        400,
        {},
      );
    }
    console.log('🚀 ~ JwtStrategy ~ validate ~ user:', user);

    return user;
  }
}
