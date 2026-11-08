import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * PrismaClient dùng chung cho toàn app (inject vào service).
 * Không kết nối ngay khi khởi động: Prisma tự kết nối ở truy vấn đầu tiên,
 * nên API vẫn chạy được (và /health báo db: "down") khi DB chưa sẵn sàng.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  async onModuleDestroy() {
    await this.$disconnect();
  }

  /** true nếu truy vấn được DB. */
  async isHealthy(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}
