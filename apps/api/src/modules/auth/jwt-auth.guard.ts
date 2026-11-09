import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/** Gắn vào controller/route cần đăng nhập: `@UseGuards(JwtAuthGuard)`. Thiếu/sai token → 401. */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
