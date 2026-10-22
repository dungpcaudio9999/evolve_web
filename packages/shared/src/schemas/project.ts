import { z } from 'zod';
import { hexColorSchema } from './common';

export const createProjectSchema = z.object({
  name: z.string().trim().min(1, 'Vui lòng nhập tên project').max(80),
  icon: z.string().max(32).nullable().optional(),
  color: hexColorSchema.default('#E8B07C'),
});

export const updateProjectSchema = createProjectSchema.partial();

export type CreateProjectInput = z.input<typeof createProjectSchema>;
export type UpdateProjectInput = z.input<typeof updateProjectSchema>;
