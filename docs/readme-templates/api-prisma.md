# apps/api/prisma: Database

> Copy vào `apps/api/prisma/README.md` · Người điền: **B**

## Mục đích
Định nghĩa **cấu trúc database** (Prisma schema), lưu lịch sử thay đổi (migration) và dữ liệu mẫu (seed).

## File dự kiến
| File | Vai trò | Task |
|---|---|---|
| `schema.prisma` | Định nghĩa model và enum | W2-B1 |
| `migrations/` | Migration do Prisma sinh, **không sửa tay** | W2-B1 |
| `seed.ts` | Dữ liệu mẫu: 3 users, 2 projects, khoảng 30 issues, 5 labels | W2-B2 |

## Model
| Model | Trường chính | Quan hệ |
|---|---|---|
| `User` | id, name, email, passwordHash, avatarUrl | có nhiều Project, được giao nhiều Issue |
| `Project` | id, name, icon, color | thuộc User (owner), có nhiều Issue |
| `Issue` | id, identifier, title, description, status, priority, rank | thuộc Project, có thể có assignee |
| `Label` | id, name, color | nhiều-nhiều với Issue qua `IssueLabel` |

Enum: `Status` (BACKLOG, TODO, IN_PROGRESS, DONE, CANCELED), `Priority` (NO_PRIORITY, URGENT, HIGH, MEDIUM, LOW).
<!-- TODO(B): cập nhật theo schema thật; link ERD ở docs/database/ -->

## Lệnh
```bash
pnpm --filter api prisma migrate dev --name <tên>   # tạo migration (chỉ B)
pnpm --filter api prisma db seed                    # nạp dữ liệu mẫu
pnpm --filter api prisma studio                     # xem dữ liệu
```

## Quy trình đổi schema
1. Chỉ **B** sửa `schema.prisma` và tạo migration.
2. Nếu thay đổi ảnh hưởng tới type, cập nhật `@evolve/shared` trong cùng PR và tag cả nhóm.
3. Sau khi merge, các thành viên khác chạy `pnpm --filter api prisma migrate dev` để cập nhật DB ở máy mình.
