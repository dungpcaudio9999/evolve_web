# packages/shared (`@evolve/shared`)

> Người phụ trách: **A** · Review: **B**, **C** · Task: W1-A4

## Mục đích
Đây là **contract** giữa frontend (`apps/web`) và backend (`apps/api`). Mọi kiểu dữ liệu, quy tắc validate và hằng số mà cả hai phía cần đều được định nghĩa **một lần duy nhất** ở đây.

## Cấu trúc
| File | Vai trò |
|---|---|
| `package.json` | Khai báo package `@evolve/shared` |
| `tsconfig.json`, `tsconfig.build.json` | Cấu hình TypeScript (build ra `dist/`, CommonJS + `.d.ts`) |
| `src/index.ts` | Export toàn bộ nội dung của package |
| `src/types/user.ts` | Type `User`, `AuthResponse` |
| `src/types/project.ts` | Type `Project` |
| `src/types/issue.ts` | Type `Issue` |
| `src/types/label.ts` | Type `Label` |
| `src/constants/status.ts` | `STATUSES`: Backlog, Todo, In Progress, Done, Canceled (id, tên, màu, thứ tự) |
| `src/constants/priority.ts` | `PRIORITIES`: No priority, Urgent, High, Medium, Low |
| `src/constants/index.ts` | Re-export + `ISSUE_IDENTIFIER_PREFIX` (`EVO`) |
| `src/schemas/common.ts` | `idSchema`, `hexColorSchema` |
| `src/schemas/auth.ts` | zod: `registerSchema`, `loginSchema` |
| `src/schemas/project.ts` | zod: `createProjectSchema`, `updateProjectSchema` |
| `src/schemas/issue.ts` | zod: `createIssueSchema`, `updateIssueSchema`, `moveIssueSchema`, `issueFilterSchema` |

## Định nghĩa dữ liệu
> Bản nháp, **chốt ở buổi kickoff (W1-ALL)**. B và C góp ý trực tiếp trên PR.

Quy ước chung: `id` là string (cuid/uuid do Prisma sinh); thời gian là chuỗi ISO 8601 (vì đi qua JSON); trường "chưa có" dùng `null`, không dùng `undefined`.

| Type | Trường |
|---|---|
| `User` | `id`, `name`, `email`, `avatarUrl \| null`, `createdAt`. **Không** có `passwordHash` |
| `AuthResponse` | `accessToken`, `user: User` (trả về từ `/auth/register`, `/auth/login`) |
| `Project` | `id`, `name`, `icon \| null`, `color` (hex), `ownerId`, `createdAt`, `updatedAt` |
| `Label` | `id`, `name`, `color` (hex) |
| `Issue` | `id`, `identifier` (`EVO-12`), `title`, `description \| null`, `status`, `priority`, `rank` (lexorank), `projectId`, `assigneeId \| null`, `labels: Label[]`, `createdAt`, `updatedAt` |

| Schema | Dùng cho | Ghi chú |
|---|---|---|
| `registerSchema` / `loginSchema` | `POST /auth/register`, `/auth/login` | email được trim + lowercase; mật khẩu 8–72 ký tự (giới hạn của bcrypt) |
| `createProjectSchema` / `updateProjectSchema` | `POST`, `PATCH /projects` | `color` mặc định `#E8B07C` |
| `createIssueSchema` / `updateIssueSchema` | `POST`, `PATCH /issues` | mặc định `BACKLOG`, `NO_PRIORITY`, `labelIds: []`; client gửi `labelIds`, server trả `labels` |
| `moveIssueSchema` | `PATCH /issues/:id/move` | `{ status, afterId?, beforeId? }`; server tự tính `rank` |
| `issueFilterSchema` | query `GET /issues` | `projectId`, `status`, `priority`, `assigneeId`, `q` (đều optional) |

Type input: `z.input<...>` (`CreateIssueInput`, ...) là dạng client gửi lên; muốn dạng sau khi parse (đã điền mặc định) thì dùng `z.output<typeof createIssueSchema>`.

**Câu hỏi cần chốt khi kickoff:**
1. B: `id` dùng `cuid()` hay `uuid()`? Có cần `Issue.creatorId` không?
2. B: `Label` dùng chung toàn hệ thống (như PLAN) hay thuộc về từng project?
3. C: `Issue` trả về `labels` đầy đủ là đủ, hay cần thêm `assignee`/`project` lồng sẵn để đỡ tra cứu?
4. Cả nhóm: màu status trong `STATUSES` đã hợp theme taalas chưa?

## Ví dụ sử dụng
Thêm dependency vào app: `"@evolve/shared": "workspace:*"`. Package build ra `dist/`, nên chạy `pnpm --filter @evolve/shared build` (hoặc `pnpm dev` ở gốc, đã tự build + watch) trước khi chạy app.

Web (react-hook-form + zod):
```tsx
import { zodResolver } from '@hookform/resolvers/zod';
import { createIssueSchema, type CreateIssueInput, STATUSES } from '@evolve/shared';

const form = useForm<CreateIssueInput>({ resolver: zodResolver(createIssueSchema) });
```

API (nestjs-zod):
```ts
import { createZodDto } from 'nestjs-zod';
import { createIssueSchema } from '@evolve/shared';

export class CreateIssueDto extends createZodDto(createIssueSchema) {}
```

Kiểm tra: `pnpm --filter @evolve/shared test` (build rồi chạy test bằng `node --test`).

## Quy tắc thay đổi
1. Mọi thay đổi phải qua PR và **tag cả nhóm**; A duyệt.
2. Đổi hoặc xóa trường đã có thì phải báo B (sửa API, schema Prisma) và C (sửa giao diện).
3. Thêm trường mới nên để không bắt buộc (optional) trước, để không làm vỡ code đang có.

## Liên quan
- Data model: mục Tech stack trong [PLAN.md](../../PLAN.md)
- Quy trình: [EVOLVE_WEB_TEAM_WORKFLOW.vi.md](../../docs/EVOLVE_WEB_TEAM_WORKFLOW.vi.md)
