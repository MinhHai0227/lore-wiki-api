import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Public } from 'src/common/decorators/public.decorator';
import { LocalAuthGuard } from 'src/common/guards/local-auth.guard';
import { AuthService } from './auth.service';
import type { AuthUser } from './auth.service';

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
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Public()
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

  @Public()
  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
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
