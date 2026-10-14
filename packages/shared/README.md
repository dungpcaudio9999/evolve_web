# packages/shared (`@evolve/shared`)

> Người phụ trách: **A** · Review: **B**, **C** · Task: W1-A4

## Mục đích
Đây là **contract** giữa frontend (`apps/web`) và backend (`apps/api`). Mọi kiểu dữ liệu, quy tắc validate và hằng số mà cả hai phía cần đều được định nghĩa **một lần duy nhất** ở đây.

## Cấu trúc dự kiến
| File | Vai trò |
|---|---|
| `package.json` | Khai báo package `@evolve/shared` |
| `tsconfig.json` | Cấu hình TypeScript |
| `src/index.ts` | Export toàn bộ nội dung của package |
| `src/types/user.ts` | Type `User` |
| `src/types/project.ts` | Type `Project` |
| `src/types/issue.ts` | Type `Issue` |
| `src/types/label.ts` | Type `Label` |
| `src/constants/status.ts` | `STATUSES`: Backlog, Todo, In Progress, Done, Canceled (id, tên, màu, thứ tự) |
| `src/constants/priority.ts` | `PRIORITIES`: No priority, Urgent, High, Medium, Low |
| `src/schemas/auth.ts` | zod: `registerSchema`, `loginSchema` |
| `src/schemas/project.ts` | zod: `createProjectSchema`, `updateProjectSchema` |
| `src/schemas/issue.ts` | zod: `createIssueSchema`, `updateIssueSchema`, `moveIssueSchema`, `issueFilterSchema` |

## Định nghĩa dữ liệu
<!-- TODO(A): mô tả từng trường của User, Project, Issue, Label sau khi chốt ở buổi họp tuần 1 -->

## Ví dụ sử dụng
<!-- TODO(A): ví dụ dùng ở web (react-hook-form + zodResolver) và ở api (nestjs-zod DTO) -->

## Quy tắc thay đổi
1. Mọi thay đổi phải qua PR và **tag cả nhóm**; A duyệt.
2. Đổi hoặc xóa trường đã có thì phải báo B (sửa API, schema Prisma) và C (sửa giao diện).
3. Thêm trường mới nên để không bắt buộc (optional) trước, để không làm vỡ code đang có.

## Liên quan
- Data model: mục Tech stack trong [PLAN.md](../../PLAN.md)
- Quy trình: [EVOLVE_WEB_TEAM_WORKFLOW.vi.md](../../docs/EVOLVE_WEB_TEAM_WORKFLOW.vi.md)
