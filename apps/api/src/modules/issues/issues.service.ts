import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type {
  CreateIssueInput,
  Issue,
  IssueFilter,
  Status,
  UpdateIssueInput,
} from '@evolve/shared';
import { Prisma } from '@prisma/client';
import { rankAfter } from '../../common/utils/rank';
import { ISSUE_INCLUDE, toIssue } from '../../common/utils/to-issue';
import { PrismaService } from '../../prisma/prisma.service';

type Tx = Prisma.TransactionClient;

/** Chỉ thao tác trên issue thuộc project mà người dùng sở hữu; còn lại coi như không tồn tại (404). */
@Injectable()
export class IssuesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(ownerId: string, filter: IssueFilter): Promise<Issue[]> {
    const q = filter.q?.trim();
    const rows = await this.prisma.issue.findMany({
      where: {
        project: { ownerId },
        projectId: filter.projectId,
        status: filter.status,
        priority: filter.priority,
        assigneeId: filter.assigneeId,
        ...(q && {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { identifier: { contains: q, mode: 'insensitive' } },
          ],
        }),
      },
      include: ISSUE_INCLUDE,
      orderBy: [{ rank: 'asc' }, { createdAt: 'asc' }],
    });
    return rows.map(toIssue);
  }

  async get(ownerId: string, id: string): Promise<Issue> {
    return toIssue(await this.findOwned(ownerId, id));
  }

  async create(ownerId: string, input: CreateIssueInput): Promise<Issue> {
    const status = input.status ?? 'BACKLOG';
    const project = await this.prisma.project.findFirst({
      where: { id: input.projectId, ownerId },
      select: { id: true },
    });
    if (!project) throw new NotFoundException('Không tìm thấy project');
    await this.assertAssignee(input.assigneeId);

    const row = await this.prisma.$transaction(async (tx) => {
      // Tăng bộ đếm trong transaction để hai yêu cầu đồng thời không lấy trùng số.
      const { issueCounter, key } = await tx.project.update({
        where: { id: project.id },
        data: { issueCounter: { increment: 1 } },
        select: { issueCounter: true, key: true },
      });
      return tx.issue.create({
        data: {
          number: issueCounter,
          identifier: `${key}-${issueCounter}`,
          title: input.title,
          description: input.description ?? null,
          status,
          priority: input.priority ?? 'NO_PRIORITY',
          rank: await this.rankAtEnd(tx, project.id, status),
          projectId: project.id,
          assigneeId: input.assigneeId ?? null,
          labels: { create: (input.labelIds ?? []).map((labelId) => ({ labelId })) },
        },
        include: ISSUE_INCLUDE,
      });
    });
    return toIssue(row);
  }

  async update(ownerId: string, id: string, input: UpdateIssueInput): Promise<Issue> {
    const existing = await this.findOwned(ownerId, id);
    if (input.assigneeId) await this.assertAssignee(input.assigneeId);
    const statusChanged = input.status !== undefined && input.status !== existing.status;

    const row = await this.prisma.$transaction(async (tx) =>
      tx.issue.update({
        where: { id },
        data: {
          ...(input.title !== undefined && { title: input.title }),
          ...(input.description !== undefined && { description: input.description }),
          ...(input.priority !== undefined && { priority: input.priority }),
          ...(input.assigneeId !== undefined && { assigneeId: input.assigneeId }),
          ...(statusChanged && {
            status: input.status,
            // Đổi trạng thái → xuống cuối cột mới (kéo thả giữa các issue là PATCH /move ở tuần 5).
            rank: await this.rankAtEnd(tx, existing.projectId, input.status!, id),
          }),
          ...(input.labelIds !== undefined && {
            labels: { deleteMany: {}, create: input.labelIds.map((labelId) => ({ labelId })) },
          }),
        },
        include: ISSUE_INCLUDE,
      }),
    );
    return toIssue(row);
  }

  async remove(ownerId: string, id: string): Promise<void> {
    await this.findOwned(ownerId, id);
    await this.prisma.issue.delete({ where: { id } });
  }

  private async findOwned(ownerId: string, id: string) {
    const row = await this.prisma.issue.findFirst({
      where: { id, project: { ownerId } },
      include: ISSUE_INCLUDE,
    });
    if (!row) throw new NotFoundException('Không tìm thấy issue');
    return row;
  }

  private async assertAssignee(assigneeId: string | null | undefined) {
    if (!assigneeId) return;
    const exists = await this.prisma.user.count({ where: { id: assigneeId } });
    if (!exists) throw new BadRequestException('Người được giao không tồn tại');
  }

  private async rankAtEnd(tx: Tx, projectId: string, status: Status, exceptId?: string) {
    const last = await tx.issue.findFirst({
      where: { projectId, status, ...(exceptId && { id: { not: exceptId } }) },
      orderBy: { rank: 'desc' },
      select: { rank: true },
    });
    return rankAfter(last?.rank);
  }
}
