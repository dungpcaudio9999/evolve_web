# apps/api/prisma: Database

> Người phụ trách: **B** · Prisma 6, PostgreSQL 16

## Mục đích
Định nghĩa **cấu trúc database** (Prisma schema), lưu lịch sử thay đổi (migration) và dữ liệu mẫu (seed).

## File dự kiến
| File | Vai trò | Task |
|---|---|---|
| `schema.prisma` ✅ | Định nghĩa model và enum | W2-B1 |
| `migrations/` ✅ | Migration do Prisma sinh, **không sửa tay** (`20261108100546_init`) | W2-B1 |
| `seed.ts` ✅ | Dữ liệu mẫu: 3 users, 2 projects (EVO, MOB), 30 issues, 5 labels. **Xóa dữ liệu cũ** rồi nạp lại | W2-B2 |

## Model
Tên bảng và cột trong DB dùng `snake_case` (`@@map`, `@map`); trong code dùng `camelCase`.

| Model (bảng) | Trường chính | Ràng buộc / quan hệ |
|---|---|---|
| `User` (`users`) | id, name, email, passwordHash, avatarUrl, createdAt, updatedAt | `email` duy nhất; có nhiều Project; được giao nhiều Issue |
| `Project` (`projects`) | id, name, key, icon, color, issueCounter, ownerId, createdAt, updatedAt | `(ownerId, key)` duy nhất; xóa User → xóa Project |
| `Issue` (`issues`) | id, number, identifier, title, description, status, priority, rank, projectId, assigneeId, createdAt, updatedAt | `(projectId, number)` duy nhất; index `(projectId, status, rank)` cho board; xóa Project → xóa Issue; xóa User → `assigneeId = null` |
| `Label` (`labels`) | id, name, color | `name` duy nhất |
| `IssueLabel` (`issue_labels`) | issueId, labelId | Khóa chính ghép; bảng nối nhiều-nhiều Issue ↔ Label |

Enum: `Status` (BACKLOG, TODO, IN_PROGRESS, DONE, CANCELED), `Priority` (NO_PRIORITY, URGENT, HIGH, MEDIUM, LOW), khớp với `STATUS_IDS`, `PRIORITY_IDS` trong `@evolve/shared`.

### Sinh identifier
Khi tạo issue (W4-B1): trong một transaction, tăng `Project.issueCounter` lên 1, rồi đặt `number = issueCounter` và `identifier = "<key>-<number>"`.

### Khác với contract
- `passwordHash`, `issueCounter`, `number` chỉ có ở DB, **không** trả về qua API.
- `Issue.labels` trong contract là `Label[]`; trong DB đi qua bảng nối `IssueLabel`.

## Dữ liệu mẫu (seed)
| Tài khoản | Mật khẩu | Ghi chú |
|---|---|---|
| `an@evolve.dev` (Nguyễn Văn An) | `password123` | Chủ của cả 2 project |
| `binh@evolve.dev` (Trần Thị Bình) | `password123` | Được giao issue |
| `chi@evolve.dev` (Lê Minh Chi) | `password123` | Được giao issue |

- Project `EVO` (Evolve Web) và `MOB` (Mobile App), mỗi project 15 issue phủ đủ 5 trạng thái và 5 độ ưu tiên.
- `rank` sinh bằng `@kayron013/lexorank`: mỗi cột bắt đầu từ `0|i` rồi tăng dần (`0|j`, `0|k`…).
- Mật khẩu băm bằng `bcryptjs` (thuần JS, tương thích bcrypt, không cần biên dịch native).

## Lệnh
```bash
# Lần đầu: chạy PostgreSQL (docker compose up -d) và tạo apps/api/.env từ .env.example
pnpm --filter api db:migrate                        # áp migration vào DB local (tự chạy prisma generate)
pnpm --filter api db:migrate --name <tên>           # tạo migration mới sau khi sửa schema (chỉ B)
pnpm --filter api db:seed                           # XÓA dữ liệu cũ, nạp dữ liệu mẫu
pnpm --filter api db:studio                         # xem dữ liệu ở http://localhost:5555
pnpm --filter api db:reset                          # XÓA toàn bộ dữ liệu và chạy lại migration
pnpm --filter api db:deploy                         # áp migration trên môi trường deploy (không tạo mới)
```

## Quy trình đổi schema
1. Chỉ **B** sửa `schema.prisma` và tạo migration.
2. Nếu thay đổi ảnh hưởng tới type, cập nhật `@evolve/shared` trong cùng PR và tag cả nhóm.
3. Sau khi merge, các thành viên khác chạy `pnpm --filter api prisma migrate dev` để cập nhật DB ở máy mình.
