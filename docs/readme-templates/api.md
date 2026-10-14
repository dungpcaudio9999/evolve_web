# apps/api: Backend

> Copy vào `apps/api/README.md` sau W1-B2 · Người điền: **B**

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
| `src/main.ts` | Khởi động app: CORS, Swagger, cổng | – |
| `src/app.module.ts` | Module gốc, import các module | – |
| `src/modules/` | Các module nghiệp vụ | [src/modules/README.md](src/modules/README.md) |
| `src/prisma/` | `PrismaService`, `PrismaModule` | – |
| `src/common/` | Exception filter, guard, decorator (`@CurrentUser`) dùng chung | – |
| `prisma/` | Schema, migration, seed | [prisma/README.md](prisma/README.md) |
| `test/` | Test e2e của API | – |

## Biến môi trường
| Biến | Ví dụ | Ý nghĩa |
|---|---|---|
| `DATABASE_URL` | `postgresql://evolve:evolve@localhost:5432/evolve` | Kết nối DB |
| `JWT_SECRET` | `change-me` | Khóa ký JWT |
| `CORS_ORIGIN` | `http://localhost:3000` | Địa chỉ web được phép gọi |
| `PORT` | `4000` | Cổng API |

## Lệnh
```bash
pnpm --filter api start:dev     # http://localhost:4000, Swagger: /docs
pnpm --filter api test
```
<!-- TODO(B): xác nhận lại sau khi khởi tạo -->

## Endpoint
Xem đầy đủ tại Swagger `/docs` hoặc [docs/api/](../../docs/api/).
<!-- TODO(B): bảng tóm tắt endpoint -->

## Liên quan
- Task: W1-B1…W6-B2 trong [docs/TIMELINE.md](../../docs/TIMELINE.md)
