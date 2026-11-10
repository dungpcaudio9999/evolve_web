import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { User } from '@evolve/shared';
import { toUser } from '../../common/utils/to-user';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách người dùng (để chọn người được giao)' })
  async list(): Promise<User[]> {
    const rows = await this.prisma.user.findMany({ orderBy: { name: 'asc' } });
    return rows.map(toUser);
  }
}
