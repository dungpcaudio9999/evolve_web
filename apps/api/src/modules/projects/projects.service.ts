import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { CreateProjectInput, Project, UpdateProjectInput } from '@evolve/shared';
import { Prisma } from '@prisma/client';
import { toProject } from '../../common/utils/to-project';
import { PrismaService } from '../../prisma/prisma.service';

/** Mọi thao tác đều giới hạn trong project mà `ownerId` sở hữu. */
@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(ownerId: string): Promise<Project[]> {
    const rows = await this.prisma.project.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map(toProject);
  }

  async get(ownerId: string, id: string): Promise<Project> {
    return toProject(await this.findOwned(ownerId, id));
  }

  async create(ownerId: string, input: CreateProjectInput): Promise<Project> {
    try {
      const row = await this.prisma.project.create({
        data: {
          name: input.name,
          key: input.key,
          icon: input.icon ?? null,
          color: input.color,
          ownerId,
        },
      });
      return toProject(row);
    } catch (error) {
      throw this.keyConflict(error);
    }
  }

  async update(ownerId: string, id: string, input: UpdateProjectInput): Promise<Project> {
    await this.findOwned(ownerId, id);
    const row = await this.prisma.project.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.icon !== undefined && { icon: input.icon }),
        ...(input.color !== undefined && { color: input.color }),
      },
    });
    return toProject(row);
  }

  /** Xóa project và toàn bộ issue của nó (onDelete: Cascade). */
  async remove(ownerId: string, id: string): Promise<void> {
    await this.findOwned(ownerId, id);
    await this.prisma.project.delete({ where: { id } });
  }

  /** Không phải chủ cũng trả 404, để không lộ project của người khác có tồn tại. */
  private async findOwned(ownerId: string, id: string) {
    const row = await this.prisma.project.findFirst({ where: { id, ownerId } });
    if (!row) throw new NotFoundException('Không tìm thấy project');
    return row;
  }

  private keyConflict(error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return new ConflictException('Key đã được dùng cho project khác của bạn');
    }
    return error;
  }
}
