import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { LANGUAGE_CODE } from 'src/utils/constants';
import { commonResponse } from '../../../helper';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  matchRoles(roles: string[], userRoles: string[] | undefined) {
    return userRoles && roles.some((role) => userRoles.includes(role));
  }

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    console.log('RoleGuard canActivate roles', roles);

    if (!roles) {
      return true; // No roles specified, allow access
    }

    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();

    let languageCode = req.headers.languagecode || LANGUAGE_CODE.EN;

    console.log('RoleGuard canActivate languagecode', languageCode);

    const user = req.user;

    if (!user || !user.role || !user.role.length) {
      commonResponse.error(languageCode, res, 'INVALID_USER_ROLE', 400, {});
      return false;
    }

    console.log('RoleGuard canActivate user.role', user.role);
    console.log('RoleGuard canActivate roles', roles);

    const matchRole = roles.some((role) => user.role.includes(role)); // Check if user's role matches any of the specified roles
    console.log('🚀 ~ RoleGuard ~ canActivate ~ matchRole:', matchRole);
    if (!matchRole) {
      commonResponse.error(languageCode, res, 'REQUEST_NOT_ALLOW', 400, {});
      return false;
    }

    return true;
  }
}
