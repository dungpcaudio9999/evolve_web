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
- Node.js ≥ 20.11 (khuyến nghị 22, xem `.nvmrc`)
- pnpm 10: bật bằng `corepack enable` (phiên bản ghim trong `packageManager` của `package.json`)
- Docker + Docker Compose (để chạy PostgreSQL ở local)

## Cài đặt và chạy
```bash
git clone https://github.com/dungpcaudio9999/evolve_web.git
cd evolve_web
corepack enable
pnpm install
docker compose up -d   # PostgreSQL ở localhost:5432 (user/pass/db: evolve)
pnpm dev            # build packages/shared rồi chạy song song mọi app có script dev
```
<!-- TODO(A): bổ sung bước docker compose, migrate, seed khi apps/api có Prisma (W2) -->

Các script ở thư mục gốc (chạy cho mọi package có script tương ứng):

| Lệnh | Việc |
|---|---|
| `pnpm dev` | Chạy dev cho web, api và shared (watch) |
| `pnpm build` | Build mọi package |
| `pnpm lint` | Lint |
| `pnpm typecheck` | Kiểm tra type |
| `pnpm test` | Chạy test |
| `pnpm format` | Format bằng Prettier |

Chạy riêng một package: `pnpm --filter web dev`, `pnpm --filter api dev`, `pnpm --filter @evolve/shared build`.

## Biến môi trường
Mẫu đầy đủ ở [.env.example](.env.example). Không commit file `.env` thật.

| App | Biến | Mặc định ở local |
|---|---|---|
| gốc (docker) | `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `POSTGRES_PORT` | `evolve`, `evolve`, `evolve`, `5432` |
| api | `DATABASE_URL` | `postgresql://evolve:evolve@localhost:5432/evolve?schema=public` |
| api | `JWT_SECRET`, `JWT_EXPIRES_IN` | tự đặt, `7d` |
| api | `PORT`, `CORS_ORIGIN` | `4000`, `http://localhost:3000` |
| web | `NEXT_PUBLIC_API_URL` | `http://localhost:4000` |

## Tài liệu
- [PLAN.md](PLAN.md): kế hoạch tổng
- [docs/](docs/README.md): phân vai, timeline, quy trình làm việc

## Thành viên
| Mã | Họ tên | Vai trò |
|---|---|---|
| A | <!-- TODO --> | Nhóm trưởng · Tech Lead, UI & DevOps |
| B | <!-- TODO --> | Backend |
| C | <!-- TODO --> | Frontend |
