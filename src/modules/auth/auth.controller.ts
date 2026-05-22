import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { authThrottle } from 'src/common/constants/auth-throttle.constants';
import { Public } from 'src/common/decorators/public.decorator';
import { GoogleAuthGuard } from 'src/common/guards/google-auth.guard';
import { LocalAuthGuard } from 'src/common/guards/local-auth.guard';
import { normalizeAuthRedirectPath } from 'src/common/utils/auth-redirect';
import { AuthService } from './auth.service';
import type { AuthUser } from './auth.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RegisterDto } from './dto/register.dto';

const REFRESH_TOKEN_COOKIE_NAME = 'refreshToken';
const REFRESH_TOKEN_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
const isProduction = process.env.NODE_ENV === 'production';

const refreshTokenCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  path: '/',
} as const;

type AuthRequest = Request & {
  user: AuthUser;
};

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Throttle({ default: authThrottle.register })
  @Post('register')
  async register(
    @Body() createUserDto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { refreshToken, ...response } =
      await this.authService.register(createUserDto);

    this.setRefreshTokenCookie(res, refreshToken);

    return response;
  }

  @UseGuards(LocalAuthGuard)
  @Public()
  @Throttle({ default: authThrottle.login })
  @Post('login')
  async login(
    @Req() req: AuthRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { refreshToken, ...response } = await this.authService.login(
      req.user,
    );

    this.setRefreshTokenCookie(res, refreshToken);

    return response;
  }

  @UseGuards(GoogleAuthGuard)
  @Public()
  @Get('google')
  googleLogin() {}

  @UseGuards(GoogleAuthGuard)
  @Public()
  @Get('google/callback')
  async googleCallback(
    @Req() req: AuthRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { refreshToken } = await this.authService.login(req.user);
    const redirectPath = normalizeAuthRedirectPath(req.query.state);

    this.setRefreshTokenCookie(res, refreshToken);

    return res.redirect(
      `${this.configService.getOrThrow<string>('app.frontendUrl')}${redirectPath}`,
    );
  }

  @Public()
  @Throttle({ default: authThrottle.refresh })
  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const currentRefreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME];

    if (!currentRefreshToken) {
      throw new UnauthorizedException({
        code: 'REFRESH_TOKEN_MISSING',
        message: 'Không tìm thấy refresh token',
      });
    }

    const { refreshToken, ...response } =
      await this.authService.refreshToken(currentRefreshToken);

    this.setRefreshTokenCookie(res, refreshToken);

    return response;
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    this.clearRefreshTokenCookie(res);

    return {
      message: 'Đăng xuất thành công',
    };
  }

  @Get('profile')
  getProfile(@Req() req: Request) {
    return req.user;
  }

  @Patch('change-password')
  async changePassword(
    @Req() req: AuthRequest,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    await this.authService.changePassword(req.user.id, changePasswordDto);

    return {
      message: 'Đổi mật khẩu thành công',
    };
  }

  private setRefreshTokenCookie(res: Response, refreshToken: string) {
    res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
      ...refreshTokenCookieOptions,
      maxAge: REFRESH_TOKEN_COOKIE_MAX_AGE,
    });
  }

  private clearRefreshTokenCookie(res: Response) {
    res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, refreshTokenCookieOptions);
  }
}
