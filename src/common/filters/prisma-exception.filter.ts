import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/client';

type PrismaErrorResponse = {
  statusCode: number;
  message: string;
  error: string;
  path: string;
  timestamp: string;
};

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter
  implements ExceptionFilter<Prisma.PrismaClientKnownRequestError>
{
  catch(
    exception: Prisma.PrismaClientKnownRequestError,
    host: ArgumentsHost,
  ) {
    const context = host.switchToHttp();
    const response = context.getResponse();
    const request = context.getRequest<{ url: string }>();
    const error = this.mapPrismaError(exception);

    response.status(error.statusCode).json({
      ...error,
      path: request.url,
      timestamp: new Date().toISOString(),
    } satisfies PrismaErrorResponse);
  }

  private mapPrismaError(exception: Prisma.PrismaClientKnownRequestError) {
    switch (exception.code) {
      case 'P2002':
        return {
          statusCode: HttpStatus.CONFLICT,
          message: this.getUniqueConstraintMessage(exception),
          error: 'Conflict',
        };
      case 'P2003':
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Bản ghi liên quan không tồn tại hoặc không thể thay đổi.',
          error: 'Bad Request',
        };
      case 'P2025':
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Không tìm thấy bản ghi.',
          error: 'Not Found',
        };
      default:
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Yêu cầu cơ sở dữ liệu thất bại.',
          error: 'Internal Server Error',
        };
    }
  }

  private getUniqueConstraintMessage(
    exception: Prisma.PrismaClientKnownRequestError,
  ) {
    const target = exception.meta?.target;

    if (Array.isArray(target) && target.length > 0) {
      return `${target.join(', ')} đã tồn tại.`;
    }

    return 'Dữ liệu đã tồn tại.';
  }
}
