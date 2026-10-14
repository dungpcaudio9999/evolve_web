# Evolve Web

> Người phụ trách: **A** · Cập nhật thêm ở W1-A2 (lệnh cài đặt) và W6-A2 (hoàn thiện)

Web quản lý dự án tối giản lấy cảm hứng từ Linear, giao diện theo phong cách taalas.com.

## Giới thiệu
<!-- TODO(A): 2–3 câu mô tả sản phẩm, người dùng, chức năng chính (F1–F7 trong PLAN.md) -->

## Tech stack
| Phần | Công nghệ |
|---|---|
| Frontend | Next.js 15, React 19, Tailwind CSS v4, shadcn/ui, Zustand |
| Backend | NestJS, Prisma, PostgreSQL, JWT |
| Dùng chung | `packages/shared` (type, zod schema) |
| Công cụ | pnpm workspaces, Docker, GitHub Actions |

## Cấu trúc thư mục
```text
evolve_web/
├── apps/
│   ├── web/          # Frontend (Next.js)
│   └── api/          # Backend (NestJS)
├── packages/
│   └── shared/       # Contract dùng chung: type, zod schema, hằng số
├── docs/             # Tài liệu dự án
└── .github/          # CI, template PR
```
Mỗi thư mục lớn có `README.md` riêng giải thích vai trò.

## Yêu cầu
<!-- TODO(A): phiên bản Node.js, pnpm, Docker -->

## Cài đặt và chạy
<!-- TODO(A, W1-A2): các lệnh clone, pnpm install, docker compose up, migrate, seed, pnpm dev -->
```bash
# TODO
```

## Biến môi trường
<!-- TODO(A): liệt kê theo .env.example của web và api -->

## Tài liệu
- [PLAN.md](PLAN.md): kế hoạch tổng
- [docs/](docs/README.md): phân vai, timeline, quy trình làm việc

## Thành viên
| Mã | Họ tên | Vai trò |
|---|---|---|
| A | <!-- TODO --> | Nhóm trưởng · Tech Lead, UI & DevOps |
| B | <!-- TODO --> | Backend |
| C | <!-- TODO --> | Frontend |
