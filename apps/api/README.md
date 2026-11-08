# apps/api: Backend

> Người phụ trách: **B** · Khởi tạo ở W1-B2

## Mục đích
REST API cho Evolve Web: xác thực người dùng, quản lý project, issue, label; lưu dữ liệu vào PostgreSQL.

## Tech stack
| Hạng mục | Công cụ |
|---|---|
| Framework | NestJS (TypeScript) |
| Database | PostgreSQL, Prisma ORM |
| Xác thực | Passport + JWT, bcrypt |
| Validate | zod (`nestjs-zod`) + `@evolve/shared` |
| Tài liệu API | Swagger tại `/docs` |
| Test | Jest + Supertest |

## Cấu trúc
| Thư mục / File | Vai trò | README |
|---|---|---|
| `src/main.ts` | Khởi động app: CORS, cổng (Swagger thêm ở W3-B3) | – |
| `src/app.module.ts` | Module gốc: `ConfigModule` (đọc `.env`), import các module | – |
| `src/modules/` | Các module nghiệp vụ | [src/modules/README.md](src/modules/README.md) |
| `src/prisma/` | `PrismaService`, `PrismaModule` (W2-B3) | – |
| `src/common/` | Exception filter, guard, decorator (`@CurrentUser`) dùng chung (W2-B3) | – |
| `prisma/` | Schema, migration, seed (W2-B1) | `prisma/README.md` (khung: `docs/readme-templates/api-prisma.md`) |
| `test/` | Test e2e của API (Jest + Supertest) | – |

## Biến môi trường
| Biến | Ví dụ | Ý nghĩa |
|---|---|---|
| `DATABASE_URL` | `postgresql://evolve:evolve@localhost:5432/evolve?schema=public` | Kết nối DB (dùng từ W2) |
| `JWT_SECRET` | `change-me` | Khóa ký JWT (dùng từ W3) |
| `JWT_EXPIRES_IN` | `7d` | Thời hạn JWT |
| `CORS_ORIGIN` | `http://localhost:3000` | Địa chỉ web được phép gọi; nhiều địa chỉ ngăn cách bằng dấu phẩy |
| `PORT` | `4000` | Cổng API |

Tạo file `.env` từ mẫu: `cp apps/api/.env.example apps/api/.env`. Nếu không có `.env`, API vẫn chạy với giá trị mặc định (cổng 4000, CORS cho `http://localhost:3000`).

## Lệnh
Chạy ở thư mục gốc repo. API dùng `@evolve/shared` nên cần build package này một lần trước (`pnpm dev` ở gốc đã tự làm):
```bash
pnpm --filter @evolve/shared build
pnpm --filter api dev          # http://localhost:4000, tự khởi động lại khi sửa code
pnpm --filter api build        # build ra dist/
pnpm --filter api start:prod   # chạy bản build
pnpm --filter api lint         # kiểm tra (lint:fix để tự sửa)
pnpm --filter api typecheck
pnpm --filter api test         # unit test + e2e test
```

## Endpoint
Xem đầy đủ tại Swagger `/docs` (từ W3-B3) hoặc [docs/api/](../../docs/api/).

| Method | Path | Mô tả | Cần JWT | Trạng thái |
|---|---|---|---|---|
| GET | `/health` | Kiểm tra API còn sống → `{ status: 'ok', timestamp }` | Không | ✅ W1-B2 |
| POST | `/auth/register`, `/auth/login` | Đăng ký, đăng nhập | Không | W3-B1 |
| GET | `/auth/me` | Người dùng hiện tại | Có | W3-B1 |
| GET/POST/PATCH/DELETE | `/projects…` | CRUD project | Có | W3-B2 |
| GET/POST/PATCH/DELETE | `/issues…`, `PATCH /issues/:id/move` | CRUD issue, kéo thả | Có | W4-B1, W5-B1 |
| GET | `/users`, `/labels` | Danh sách người dùng, nhãn | Có | W4-B2 |

## Liên quan
- Task: W1-B1…W6-B2 trong [docs/TIMELINE.md](../../docs/TIMELINE.md)
