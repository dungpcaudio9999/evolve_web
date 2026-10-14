# packages/

> Người phụ trách: **A**

## Mục đích
Chứa **thư viện nội bộ dùng chung** giữa các app trong `apps/`. Package ở đây không tự chạy được; chúng được `web` và `api` import.

## Cấu trúc
| Thư mục | Vai trò | Tên package | Người phụ trách |
|---|---|---|---|
| `shared/` | Contract giữa frontend và backend: type, zod schema, hằng số | `@evolve/shared` | A |

## Cách dùng
```jsonc
// apps/web/package.json hoặc apps/api/package.json
"dependencies": { "@evolve/shared": "workspace:*" }
```
```ts
import { Issue, createIssueSchema, STATUSES } from '@evolve/shared';
```
<!-- TODO(A, W1-A4): xác nhận lại cách build/export (dùng source TS trực tiếp hay build ra dist) -->

## Quy ước
- Chỉ thêm package mới khi code thật sự được **cả hai app** dùng.
- Package không phụ thuộc vào Next.js hay NestJS.

## Liên quan
- Task: W1-A4 trong [TIMELINE.md](../docs/TIMELINE.md)
