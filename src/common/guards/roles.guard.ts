import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from 'src/generated/prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

type RequestUser = {
  role?: UserRole;
};

type RequestWithUser = {
  user?: RequestUser;
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles?.length) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest<RequestWithUser>();

    if (!user?.role) {
      throw new UnauthorizedException('Cần đăng nhập để sử dụng dịch vụ');
    }

    if (!user.role && !requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Bạn không đủ quyền hạn');
    }

    return true;
  }
}
