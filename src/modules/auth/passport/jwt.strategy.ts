import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/generated/prisma/client';

type JwtAccessPayload = {
  sub: string;
  email: string;
  name: string | null;
  role: User['role'];
  tokenType?: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('auth.jwt.accessSecret'),
    });
  }

  validate(payload: JwtAccessPayload) {
    if (payload.tokenType !== 'access') {
      throw new UnauthorizedException('Access token không hợp lệ');
    }

    return {
      id: payload.sub,
      email: payload.email,
      displayName: payload.name,
      role: payload.role,
    };
  }
}
