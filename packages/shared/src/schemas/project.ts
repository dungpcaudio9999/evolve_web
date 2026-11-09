import { z } from 'zod';
import { hexColorSchema } from './common';

export const createProjectSchema = z.object({
  name: z.string().trim().min(1, 'Vui lòng nhập tên project').max(80),
  key: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z][A-Z0-9]{1,4}$/, 'Key gồm 2–5 ký tự chữ/số, bắt đầu bằng chữ'),
  icon: z.string().max(32).nullable().optional(),
  color: hexColorSchema.default('#E8B07C'),
});

/** Không cho đổi key vì key đã nằm trong identifier của các issue. */
export const updateProjectSchema = createProjectSchema.omit({ key: true }).partial();

export type CreateProjectInput = z.input<typeof createProjectSchema>;
export type UpdateProjectInput = z.input<typeof updateProjectSchema>;
