import type { User } from '@evolve/shared';
import type { User as UserRow } from '@prisma/client';

/** Chuyển bản ghi DB sang `User` của contract. Không bao giờ để lọt `passwordHash`. */
export function toUser(row: UserRow): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    avatarUrl: row.avatarUrl,
    createdAt: row.createdAt.toISOString(),
  };
}
