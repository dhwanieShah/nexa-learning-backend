import { ApiProperty } from '@nestjs/swagger';
import { Status, Roles } from 'src/auth/entities/users.entity';

export class CreateUserDto {
  @ApiProperty()
  readonly firstName: string;

  @ApiProperty()
  readonly lastName: string;

  @ApiProperty()
  readonly name: string;

  @ApiProperty()
  readonly email: string;

  @ApiProperty()
  readonly password: string;

  @ApiProperty()
  readonly role: Roles;

  @ApiProperty()
  readonly otp: number;

  @ApiProperty()
  readonly status: Status;

  @ApiProperty()
  readonly fcmToken: string;

  @ApiProperty()
  readonly deviceType: string;

  @ApiProperty()
  readonly deviceId: string;

  @ApiProperty()
  readonly deviceName: string;

  @ApiProperty()
  readonly loginTime: string;

  @ApiProperty()
  readonly googleId: string;

  @ApiProperty()
  readonly appleId: string;

  @ApiProperty()
  readonly facebookId: string;

  @ApiProperty()
  readonly loginType: string;

  @ApiProperty()
  readonly isFirstTimeLogin: string;
}
