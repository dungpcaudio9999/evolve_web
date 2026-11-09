import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface HealthResponse {
  status: 'ok';
  /** Trạng thái kết nối PostgreSQL. API vẫn trả 200 khi DB "down" để biết app còn sống. */
  db: 'up' | 'down';
  timestamp: string;
}

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  /** Kiểm tra API và DB (cũng dùng để đánh thức Render trước khi demo). */
  @Get()
  async check(): Promise<HealthResponse> {
    const dbUp = await this.prisma.isHealthy();
    return { status: 'ok', db: dbUp ? 'up' : 'down', timestamp: new Date().toISOString() };
  }
}
