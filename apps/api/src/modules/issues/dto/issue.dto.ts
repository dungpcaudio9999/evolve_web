import {
  createIssueSchema,
  issueFilterSchema,
  moveIssueSchema,
  updateIssueSchema,
} from '@evolve/shared';
import { createZodDto } from 'nestjs-zod';

export class CreateIssueDto extends createZodDto(createIssueSchema) {}
/** `projectId` gửi kèm bị bỏ qua: issue không chuyển sang project khác vì identifier gắn với project. */
export class UpdateIssueDto extends createZodDto(updateIssueSchema) {}
export class IssueFilterDto extends createZodDto(issueFilterSchema) {}
/** Kéo thả: trạng thái mới + issue ngay trên (`afterId`) và ngay dưới (`beforeId`) vị trí thả. */
export class MoveIssueDto extends createZodDto(moveIssueSchema) {}
