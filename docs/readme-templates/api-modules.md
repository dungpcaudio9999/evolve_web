# apps/api/src/modules: Module nghiệp vụ

> Copy vào `apps/api/src/modules/README.md` · Người điền: **B**

## Mục đích
Mỗi thư mục là một **module NestJS** phụ trách một nhóm chức năng.

## Cấu trúc một module
```text
issues/
├── issues.module.ts        # khai báo controller, service, import
├── issues.controller.ts    # định nghĩa route, nhận request
├── issues.service.ts       # xử lý nghiệp vụ, gọi Prisma
├── dto/                    # DTO tạo từ zod schema trong @evolve/shared
└── issues.service.spec.ts  # unit test (nếu có)
```

## Luồng xử lý request
```text
Request → JwtAuthGuard → Controller (validate DTO) → Service → PrismaService → PostgreSQL
```

## Danh sách module
| Module | Endpoint | Vai trò | Task |
|---|---|---|---|
| `auth/` | `POST /auth/register`, `POST /auth/login`, `GET /auth/me` | Đăng ký, đăng nhập, JWT strategy và guard | W3-B1 |
| `users/` | `GET /users` | Danh sách người dùng (để chọn assignee) | W4-B2 |
| `projects/` | `GET/POST /projects`, `GET/PATCH/DELETE /projects/:id` | CRUD project của người dùng hiện tại | W3-B2 |
| `issues/` | `GET/POST /issues`, `GET/PATCH/DELETE /issues/:id`, `PATCH /issues/:id/move` | CRUD issue, filter, kéo thả (lexorank) | W4-B1, W5-B1 |
| `labels/` | `GET /labels` | Danh sách nhãn | W4-B2 |

## Quy ước
- Controller mỏng, logic đặt trong service.
- Mọi route (trừ `auth/register`, `auth/login`, `health`) đều cần JWT.
- Chỉ trả về dữ liệu thuộc về người dùng hiện tại.
<!-- TODO(B): bổ sung -->
