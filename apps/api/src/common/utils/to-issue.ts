import type { Issue } from '@evolve/shared';
import type { Issue as IssueRow, Label as LabelRow } from '@prisma/client';

export type IssueRowWithLabels = IssueRow & { labels: { label: LabelRow }[] };

/** Prisma include để lấy kèm nhãn, dùng chung cho mọi truy vấn issue. */
export const ISSUE_INCLUDE = { labels: { include: { label: true } } } as const;

/** Chuyển bản ghi DB sang `Issue` của contract (bỏ `number` chỉ dùng nội bộ). */
export function toIssue(row: IssueRowWithLabels): Issue {
  return {
    id: row.id,
    identifier: row.identifier,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    rank: row.rank,
    projectId: row.projectId,
    assigneeId: row.assigneeId,
    labels: row.labels
      .map(({ label }) => ({ id: label.id, name: label.name, color: label.color }))
      .sort((a, b) => a.name.localeCompare(b.name)),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
