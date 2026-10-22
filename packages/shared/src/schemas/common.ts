import { z } from 'zod';

export const idSchema = z.string().min(1);

export const hexColorSchema = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, 'Màu phải có dạng #RRGGBB');
