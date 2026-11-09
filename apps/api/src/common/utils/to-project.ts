import type { Project } from '@evolve/shared';
import type { Project as ProjectRow } from '@prisma/client';

/** Chuyển bản ghi DB sang `Project` của contract (bỏ `issueCounter` chỉ dùng nội bộ). */
export function toProject(row: ProjectRow): Project {
  return {
    id: row.id,
    name: row.name,
    key: row.key,
    icon: row.icon,
    color: row.color,
    ownerId: row.ownerId,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
