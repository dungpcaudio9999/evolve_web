import { createIssueSchema, issueFilterSchema, updateIssueSchema } from '@evolve/shared';
import { createZodDto } from 'nestjs-zod';

export class CreateIssueDto extends createZodDto(createIssueSchema) {}
/** `projectId` gửi kèm bị bỏ qua: issue không chuyển sang project khác vì identifier gắn với project. */
export class UpdateIssueDto extends createZodDto(updateIssueSchema) {}
export class IssueFilterDto extends createZodDto(issueFilterSchema) {}
