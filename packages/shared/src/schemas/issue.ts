import { z } from 'zod';
import { DEFAULT_PRIORITY, DEFAULT_STATUS, PRIORITY_IDS, STATUS_IDS } from '../constants';
import { idSchema } from './common';

export const statusSchema = z.enum(STATUS_IDS);
export const prioritySchema = z.enum(PRIORITY_IDS);

export const createIssueSchema = z.object({
  title: z.string().trim().min(1, 'Vui lòng nhập tiêu đề').max(200),
  description: z.string().max(10_000).nullable().optional(),
  status: statusSchema.default(DEFAULT_STATUS),
  priority: prioritySchema.default(DEFAULT_PRIORITY),
  projectId: idSchema,
  assigneeId: idSchema.nullable().optional(),
  labelIds: z.array(idSchema).default([]),
});

export const updateIssueSchema = createIssueSchema.partial();

/**
 * Kéo thả trên board: chuyển issue sang `status` và đặt giữa hai issue lân cận.
 * API tự tính `rank` mới từ `afterId`/`beforeId` (null = đầu/cuối cột).
 */
export const moveIssueSchema = z.object({
  status: statusSchema,
  /** Issue nằm ngay phía trên vị trí thả */
  afterId: idSchema.nullable().optional(),
  /** Issue nằm ngay phía dưới vị trí thả */
  beforeId: idSchema.nullable().optional(),
});

/** Query string của `GET /issues` */
export const issueFilterSchema = z.object({
  projectId: idSchema.optional(),
  status: statusSchema.optional(),
  priority: prioritySchema.optional(),
  assigneeId: idSchema.optional(),
  q: z.string().trim().max(100).optional(),
});

export type CreateIssueInput = z.input<typeof createIssueSchema>;
export type UpdateIssueInput = z.input<typeof updateIssueSchema>;
export type MoveIssueInput = z.input<typeof moveIssueSchema>;
export type IssueFilter = z.input<typeof issueFilterSchema>;
