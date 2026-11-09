import { createProjectSchema, updateProjectSchema } from '@evolve/shared';
import { createZodDto } from 'nestjs-zod';

export class CreateProjectDto extends createZodDto(createProjectSchema) {}
/** Không có `key`: key đã nằm trong identifier của issue nên không cho đổi. */
export class UpdateProjectDto extends createZodDto(updateProjectSchema) {}
