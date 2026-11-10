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
| Tài liệu API | Swagger tại `/docs` (JSON: `/docs-json`) |
| Test | Jest + Supertest |

## Cấu trúc
| Thư mục / File | Vai trò | README |
|---|---|---|
| `src/main.ts` | Khởi động app: CORS, Swagger, cổng | – |
| `src/swagger.ts` | `setupSwagger(app)`: cấu hình `/docs`, nút Authorize (Bearer JWT) | – |
| `src/app.module.ts` | Module gốc: `ConfigModule` (đọc `.env`), `ZodValidationPipe` global, `AllExceptionsFilter` global, import các module | – |
| `src/modules/` | Các module nghiệp vụ | [src/modules/README.md](src/modules/README.md) |
| `src/prisma/` | `PrismaService` (kết nối lười, `isHealthy()`), `PrismaModule` (global) | – |
| `src/common/` | `filters/all-exceptions.filter.ts`: mọi lỗi trả về dạng `{ statusCode, message, errors?, path, timestamp }`, lỗi Prisma P2002/P2025/P2003 → 409/404/400. Guard, decorator thêm ở W3 | – |
| `prisma/` | Schema, migration, seed | [prisma/README.md](prisma/README.md) |
| `test/` | Test e2e (Jest + Supertest). `auth.e2e-spec.ts`, `projects.e2e-spec.ts` cần PostgreSQL (`DATABASE_URL` đọc từ `.env` qua `dotenv`); không có thì tự bỏ qua | – |

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
pnpm --filter api test         # unit test + e2e test (e2e chạy tuần tự --runInBand vì dùng chung DB)
```

## Xác thực (JWT)
- `POST /auth/login` trả `accessToken`; gửi kèm header `Authorization: Bearer <accessToken>` cho route cần đăng nhập.
- Route cần đăng nhập: thêm `@UseGuards(JwtAuthGuard)` (`src/modules/auth/jwt-auth.guard.ts`), lấy user bằng `@CurrentUser() user: AuthUser` (`src/common/decorators/current-user.decorator.ts`).
- `JWT_SECRET` bắt buộc khi `NODE_ENV=production`; ở máy dev thiếu thì dùng khóa tạm. `JWT_EXPIRES_IN` mặc định `7d`.
- Mật khẩu băm bằng `bcryptjs` (10 vòng). Sai email hay sai mật khẩu đều trả cùng thông báo "Sai email hoặc mật khẩu".
- Thử nhanh: tài khoản seed `an@evolve.dev` / `password123`, hoặc nút **Authorize** trên `/docs`.

## Validation
- DTO tạo từ zod schema của `@evolve/shared`: `class CreateIssueDto extends createZodDto(createIssueSchema) {}`.
- `ZodValidationPipe` (global) kiểm tra body/query; sai thì trả 400:
  `{ "statusCode": 400, "message": "Dữ liệu không hợp lệ", "errors": { "title": ["Vui lòng nhập tiêu đề"] }, … }`

> ⚠️ **Ghim `@nestjs/swagger` ở 11.4.2.** Từ 11.4.3, gói này thêm trường `exports` chặn import sâu, làm `patchNestJsSwagger()` của `nestjs-zod` 4 lỗi "Cannot find module …/schema-object-factory". `nestjs-zod` 5 đã sửa nhưng cần zod 4 (contract đang dùng zod 3). Không nâng cấp khi chưa đổi cả hai.

## Endpoint
Xem đầy đủ tại Swagger http://localhost:4000/docs hoặc [docs/api/](../../docs/api/).

| Method | Path | Mô tả | Cần JWT | Trạng thái |
|---|---|---|---|---|
| GET | `/health` | Kiểm tra API và DB → `{ status: 'ok', db: 'up' \| 'down', timestamp }` | Không | ✅ W1-B2, W2-B3 |
| POST | `/auth/register`, `/auth/login` | Đăng ký (201), đăng nhập (200) → `{ accessToken, user }`; email trùng 409, sai mật khẩu 401 | Không | ✅ W3-B1 |
| GET | `/auth/me` | Người dùng hiện tại | Có | ✅ W3-B1 |
| GET/POST/PATCH/DELETE | `/projects`, `/projects/:id` | CRUD project **của chính mình** (người khác → 404); key trùng → 409; không đổi được key; xóa → 204 | Có | ✅ W3-B2 |
| GET/POST/PATCH/DELETE | `/issues`, `/issues/:id` | CRUD issue trong project của mình; lọc `projectId`, `status`, `priority`, `assigneeId`, `q`; tự sinh `KEY-số`; người khác → 404 | Có | ✅ W4-B1 |
| PATCH | `/issues/:id/move` | Kéo thả trên board (đổi status + vị trí) | Có | W5-B1 |
| GET | `/users`, `/labels` | Danh sách người dùng (để chọn người được giao), nhãn | Có | ✅ W4-B2 |

## Liên quan
- Task: W1-B1…W6-B2 trong [docs/TIMELINE.md](../../docs/TIMELINE.md)
