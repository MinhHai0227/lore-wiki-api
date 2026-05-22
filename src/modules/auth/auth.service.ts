import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { StringValue } from 'ms';
import { hashPassword, verifyPassword } from 'src/common/utils/password';
import { User } from 'src/generated/prisma/client';
import { UsersService } from '../users/users.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RegisterDto } from './dto/register.dto';

export type AuthUser = Omit<User, 'passwordHash'>;

export type AuthTokenUser = Pick<
  AuthUser,
  'id' | 'email' | 'displayName' | 'avatarUrl' | 'role'
>;

export type AuthTokenResponse = {
  accessToken: string;
  refreshToken: string;
  user: AuthTokenUser;
};

type AuthTokenPayload = {
  sub: string;
  email: string;
  name: string | null;
  role: User['role'];
};

type JwtRefreshPayload = AuthTokenPayload & {
  tokenType?: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(email: string, pass: string): Promise<AuthUser | null> {
    const user = await this.usersService.findByEmail(email);
    const isPasswordValid = await verifyPassword(pass, user?.passwordHash);

    if (!user || !isPasswordValid) {
      return null;
    }

    const { passwordHash, ...result } = user;
    return result;
  }

  async register(createUserDto: RegisterDto): Promise<AuthTokenResponse> {
    const existingUser = await this.usersService.findByEmail(
      createUserDto.email,
    );

    if (existingUser) {
      throw new ConflictException('Email đã tồn tại trong hệ thống');
    }

    const user = await this.usersService.create(createUserDto);
    const { passwordHash, ...authUser } = user;

    return this.generateToken(authUser);
  }

  async login(user: AuthUser): Promise<AuthTokenResponse> {
    return this.generateToken(user);
  }

  async refreshToken(refreshToken: string): Promise<AuthTokenResponse> {
    const payload = await this.verifyRefreshToken(refreshToken);

    if (payload.tokenType !== 'refresh') {
      throw new UnauthorizedException({
        code: 'REFRESH_TOKEN_INVALID',
        message: 'Refresh token không hợp lệ',
      });
    }

    const user = await this.usersService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException({
        code: 'REFRESH_TOKEN_INVALID',
        message: 'Refresh token không hợp lệ',
      });
    }

    const { passwordHash, ...authUser } = user;

    return this.generateToken(authUser);
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.usersService.findById(userId);
    const isCurrentPasswordValid = await verifyPassword(
      changePasswordDto.currentPassword,
      user?.passwordHash,
    );

    if (!user || !isCurrentPasswordValid) {
      throw new UnauthorizedException('Mật khẩu hiện tại không đúng');
    }

    const isSamePassword = await verifyPassword(
      changePasswordDto.newPassword,
      user.passwordHash,
    );

    if (isSamePassword) {
      throw new UnauthorizedException(
        'Mật khẩu mới không được trùng mật khẩu cũ',
      );
    }

    const passwordHash = await hashPassword(changePasswordDto.newPassword);

    return this.usersService.updatePasswordHash(userId, passwordHash);
  }

  private async generateToken(user: AuthUser): Promise<AuthTokenResponse> {
    const payload: AuthTokenPayload = {
      sub: user.id,
      email: user.email,
      name: user.displayName,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync({
        ...payload,
        tokenType: 'access',
      }),
      this.jwtService.signAsync(
        {
          ...payload,
          tokenType: 'refresh',
        },
        {
          secret: this.configService.getOrThrow<string>(
            'auth.jwt.refreshSecret',
          ),
          expiresIn: this.configService.getOrThrow<StringValue>(
            'auth.jwt.refreshExpiresIn',
          ),
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        avatarUrl: this.usersService.getAvatarPublicUrl(user.avatarUrl),
        role: user.role,
      },
    };
  }

  private async verifyRefreshToken(refreshToken: string) {
    try {
      return await this.jwtService.verifyAsync<JwtRefreshPayload>(
        refreshToken,
        {
          secret: this.configService.getOrThrow<string>(
            'auth.jwt.refreshSecret',
          ),
        },
      );
    } catch (error) {
      if (error instanceof Error && error.name === 'TokenExpiredError') {
        throw new UnauthorizedException({
          code: 'REFRESH_TOKEN_EXPIRED',
          message: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại',
        });
      }

      throw new UnauthorizedException({
        code: 'REFRESH_TOKEN_INVALID',
        message: 'Refresh token không hợp lệ',
      });
    }
  }
}
