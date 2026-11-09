import type { ConfigService } from '@nestjs/config';

const DEV_SECRET = 'dev-only-secret-change-me';

/** Đọc cấu hình JWT. Môi trường production bắt buộc có JWT_SECRET. */
export function jwtConfig(config: ConfigService) {
  const secret = config.get<string>('JWT_SECRET');
  if (!secret && config.get<string>('NODE_ENV') === 'production') {
    throw new Error('Thiếu biến môi trường JWT_SECRET');
  }
  return {
    secret: secret || DEV_SECRET,
    expiresIn: config.get<string>('JWT_EXPIRES_IN') || '7d',
  };
}
