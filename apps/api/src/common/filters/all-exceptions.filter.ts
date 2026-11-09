import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Request, Response } from 'express';
import { ZodValidationException } from 'nestjs-zod';

/** Dạng lỗi thống nhất mà API trả về. */
export interface ApiErrorBody {
  statusCode: number;
  message: string;
  /** Lỗi validate theo từng trường, nếu có. */
  errors?: Record<string, string[]>;
  path: string;
  timestamp: string;
}

/** Chuyển mã lỗi Prisma thường gặp sang HTTP status. */
const PRISMA_STATUS: Record<string, { status: number; message: string }> = {
  P2002: { status: HttpStatus.CONFLICT, message: 'Dữ liệu đã tồn tại' },
  P2025: { status: HttpStatus.NOT_FOUND, message: 'Không tìm thấy dữ liệu' },
  P2003: { status: HttpStatus.BAD_REQUEST, message: 'Dữ liệu liên kết không hợp lệ' },
};

/** `{ "title": ["Bắt buộc"], "labelIds.0": ["…"] }`; lỗi không gắn trường nào nằm ở key "_". */
function zodFieldErrors(exception: ZodValidationException): Record<string, string[]> {
  const errors: Record<string, string[]> = {};
  for (const issue of exception.getZodError().issues) {
    const key = issue.path.length ? issue.path.join('.') : '_';
    (errors[key] ??= []).push(issue.message);
  }
  return errors;
}

/** Bắt mọi lỗi và trả về dạng ApiErrorBody; lỗi không lường trước trả 500 và ghi log. */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    let statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Lỗi máy chủ';
    let errors: Record<string, string[]> | undefined;

    if (exception instanceof ZodValidationException) {
      // Lỗi validate DTO: gom lỗi theo từng trường để web hiển thị cạnh ô nhập.
      statusCode = HttpStatus.BAD_REQUEST;
      message = 'Dữ liệu không hợp lệ';
      errors = zodFieldErrors(exception);
    } else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const body = exception.getResponse();
      if (typeof body === 'string') {
        message = body;
      } else {
        const b = body as { message?: string | string[]; errors?: Record<string, string[]> };
        message = Array.isArray(b.message)
          ? b.message.join('; ')
          : (b.message ?? exception.message);
        errors = b.errors;
      }
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const mapped = PRISMA_STATUS[exception.code];
      if (mapped) {
        statusCode = mapped.status;
        message = mapped.message;
      } else {
        this.logger.error(`Prisma ${exception.code}: ${exception.message}`);
      }
    } else {
      this.logger.error(exception instanceof Error ? exception.stack : String(exception));
    }

    const payload: ApiErrorBody = {
      statusCode,
      message,
      ...(errors ? { errors } : {}),
      path: req.url,
      timestamp: new Date().toISOString(),
    };
    res.status(statusCode).json(payload);
  }
}
