import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { normalizeAuthRedirectPath } from '../utils/auth-redirect';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  getAuthenticateOptions(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();

    return {
      state: normalizeAuthRedirectPath(request.query.redirectTo),
    };
  }
}
