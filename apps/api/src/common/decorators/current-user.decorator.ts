import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

/** Thông tin người dùng mà JwtStrategy gắn vào request sau khi xác thực token. */
export interface AuthUser {
  id: string;
  email: string;
}

/** `@CurrentUser() user: AuthUser` trong controller có `@UseGuards(JwtAuthGuard)`. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser =>
    ctx.switchToHttp().getRequest<Request & { user: AuthUser }>().user,
);
