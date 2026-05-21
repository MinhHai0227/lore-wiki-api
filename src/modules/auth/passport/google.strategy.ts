import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { UsersService } from '../../users/users.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      clientID: configService.getOrThrow<string>('auth.google.clientId'),
      clientSecret: configService.getOrThrow<string>(
        'auth.google.clientSecret',
      ),
      callbackURL: configService.getOrThrow<string>('auth.google.callbackUrl'),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ) {
    const email = profile.emails?.find((email) => email.verified)?.value;

    if (!email) {
      throw new UnauthorizedException('Tài khoản Google chưa xác minh email');
    }

    const user = await this.usersService.findOrCreateGoogleUser({
      email,
      displayName: profile.displayName,
      avatarUrl: profile.photos?.[0]?.value,
    });
    const { passwordHash, ...authUser } = user;

    return authUser;
  }
}
