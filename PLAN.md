# Evolve Web: Kế hoạch dự án

Web quản lý dự án tối giản lấy cảm hứng từ [Linear](https://linear.app). Giao diện theo phong cách [taalas.com](https://taalas.com).

Tài liệu liên quan: [docs/ROLES.md](docs/ROLES.md) (phân vai) · [docs/TIMELINE.md](docs/TIMELINE.md) (timeline và task theo tuần).

---

## Giai đoạn 1: Khám phá và phân tích yêu cầu

**Mục tiêu:** hiểu rõ làm cái gì, cho ai, và vì sao.

### Người dùng
Sinh viên hoặc nhóm nhỏ cần theo dõi công việc (issue) trong các dự án.

### Chức năng MVP
| # | Chức năng | Mô tả |
|---|---|---|
| F1 | Danh sách issue | Nhóm theo trạng thái: Backlog / Todo / In Progress / Done / Canceled |
| F2 | Bảng Kanban | Kéo thả issue giữa các cột để đổi trạng thái |
| F3 | CRUD issue | Tạo / sửa / xóa issue với các trường: tiêu đề, mô tả, trạng thái, độ ưu tiên, người được giao, nhãn |
| F4 | Chi tiết issue | Xem và sửa nhanh từng thuộc tính |
| F5 | Lọc và tìm kiếm | Lọc theo trạng thái, độ ưu tiên, người được giao; tìm theo từ khóa (Ctrl+K) |
| F6 | Projects | Danh sách project; mỗi issue thuộc một project |
| F7 | Đăng nhập | Đăng ký / đăng nhập; mỗi người dùng chỉ thấy workspace của mình |

### Không làm
Inbox, cycles, initiatives, reviews, AI agent, settings nâng cao, insights, timeline, đa tổ chức.

**Kết quả:** danh sách chức năng và user stories.

---

## Giai đoạn 2: Lập kế hoạch

- Chọn công nghệ: xem mục [Tech stack](#tech-stack).
- Kiến trúc: **monorepo** (pnpm workspaces) gồm frontend `apps/web` (Next.js) và backend `apps/api` (NestJS REST API). Hai app giao tiếp qua HTTP/JSON và dùng chung type và zod schema đặt trong `packages/`. Chi tiết xem mục [Cấu trúc thư mục](#cấu-trúc-thư-mục).
- Quản lý mã nguồn: Git với mô hình `main` ← `dev` ← `feature/*`. Chi tiết: [docs/EVOLVE_WEB_TEAM_WORKFLOW.vi.md](docs/EVOLVE_WEB_TEAM_WORKFLOW.vi.md).

**Kết quả:** tài liệu này và timeline (xem mục [Phân công](#phân-công-nhóm-3-người)).

---

## Giai đoạn 3: Thiết kế UX

### Sitemap
```
/login, /register
/issues              → list | board (chuyển qua lại)
/issues/[id]         → chi tiết issue
/projects            → danh sách project
/projects/[id]       → các issue của một project
```

### User flow chính
1. Đăng nhập → `/issues`
2. Nhấn `C` hoặc nút **New issue** → modal → lưu → issue hiện trong list
3. Chuyển sang Board → kéo issue sang cột khác → trạng thái được cập nhật
4. Nhấn vào issue → trang chi tiết → sửa thuộc tính

### Wireframe
Phác thảo bố cục cho: layout chung (sidebar và nội dung), list, board, modal tạo issue, trang chi tiết.

**Công cụ:** Figma / Excalidraw.

---

## Giai đoạn 4: Thiết kế UI (design system theo taalas.com)

### Bảng màu
| Token | Giá trị | Dùng cho |
|---|---|---|
| `--background` | `#101522` | Nền chính (navy rất tối) |
| `--card` / `--sidebar` | navy sáng hơn một bậc (khoảng `#161C2C`) | Card, sidebar, popover |
| `--foreground` | `#FFFFFF` | Chữ chính |
| `--muted-foreground` | `#A3A9B6` | Chữ phụ |
| `--primary` / `--ring` | `#E8B07C` | Màu nhấn: nút, focus, mục active |
| `--accent-ice` | `#D5EFF4` | Màu phụ (xanh băng nhạt) |
| `--accent-cream` | `#F2E3BC` | Màu phụ (kem) |
| `--accent-teal` | `#3E6C76` | Màu phụ (teal tối) |
| `--border` | `rgb(255 255 255 / 8%)` | Viền |

Gradient tiêu đề: `linear-gradient(92deg, #D5EFF4, #F2E3BC 28%, #E8B07C 61%, #3E6C76)`, áp lên chữ (`background-clip: text`).

### Font
- **Panchang** (Fontshare): logo, tiêu đề trang
- **Poppins** (Google Fonts): nội dung

### Component
- Nút chính dạng viên thuốc (`border-radius: 9999px`), viền `#E8B07C`, nền trong suốt; khi hover thì nền cam nhạt.
- Card và modal bo góc `0.8rem`.
- Badge trạng thái và độ ưu tiên dùng màu lấy từ bảng màu trên.

**Kết quả:** mockup (Figma) và `app/globals.css`.

---

## Giai đoạn 5: Phát triển

Làm theo hướng **contract trước**: `packages/shared` (type, zod schema, hằng số) được chốt ở tuần 1. Sau đó frontend và backend phát triển song song; frontend dùng dữ liệu mẫu cho đến khi API sẵn sàng.

| # | Việc | Chức năng |
|---|---|---|
| 1 | Dựng monorepo (pnpm workspaces); khởi tạo `apps/web` (Next.js, Tailwind, shadcn) và `apps/api` (NestJS) | – |
| 2 | Contract `packages/shared`: type, zod schema, hằng số status/priority | – |
| 3 | Design system taalas (`globals.css`, font), component UI cơ bản, layout và sidebar | – |
| 4 | Database schema (Prisma), migration, seed | – |
| 5 | Đăng nhập / đăng ký (JWT trên API, trang login/register trên web) | F7 |
| 6 | REST API projects, issues (CRUD, filter, move), users, labels; Swagger | F1–F6 |
| 7 | Trang Issues dạng list, nhóm theo trạng thái | F1 |
| 8 | Modal tạo issue, selector status/priority/assignee, xóa issue | F3 |
| 9 | Board kéo thả | F2 |
| 10 | Trang chi tiết issue | F4 |
| 11 | Thanh lọc và tìm kiếm (Ctrl+K) | F5 |
| 12 | Trang Projects | F6 |
| 13 | Hoàn thiện: responsive, trạng thái rỗng / đang tải, phím tắt | – |

Chi tiết từng task theo tuần: [docs/TIMELINE.md](docs/TIMELINE.md).

## Giai đoạn 6: Kiểm thử

- **Test API:** service và endpoint (Jest + Supertest)
- **E2E:** luồng đăng nhập, tạo issue, kéo thả (Playwright)
- **Giao diện:** responsive (360px đến 1440px); Chrome và Firefox
- **Khả năng truy cập:** độ tương phản màu, điều hướng bằng bàn phím
- **Hiệu năng:** Lighthouse ≥ 90
- **UAT:** cho 3–5 người dùng thử và ghi lại góp ý

---

## Giai đoạn 7: Triển khai và bảo trì

- **Deploy (miễn phí):** Vercel Hobby (`apps/web`), Render Free (`apps/api`), Neon Free (PostgreSQL)
  - Render Free tự ngủ khi không có truy cập; trước khi demo, gọi `GET /health` để đánh thức server.
- **Biến môi trường:**
  - api: `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`
  - web: `NEXT_PUBLIC_API_URL`
- **CI:** GitHub Actions chạy lint, typecheck và test cho mỗi PR
- **Tài liệu:** README (cài đặt, chạy, deploy) và báo cáo đồ án

---

## Tech stack

### Frontend
| Hạng mục | Công cụ | Ghi chú |
|---|---|---|
| Framework | **Next.js 15** (App Router, Turbopack) + **React 19** | Routing theo thư mục |
| Ngôn ngữ | **TypeScript** | Dùng chung type với backend qua `packages/shared` |
| Styling | **Tailwind CSS v4** + **tailwindcss-animate** | Theme cấu hình bằng CSS variables |
| UI components | **shadcn/ui** (Radix UI) | Button, dialog, dropdown, popover, command… |
| Icon | **lucide-react**, **@remixicon/react** | |
| State | **Zustand** | Store cho issues, projects, filter, giao diện |
| URL state | **nuqs** | Lưu filter và chế độ list/board lên URL |
| Form và validate | **react-hook-form** + **zod** | Dùng chung zod schema với backend |
| Kéo thả | **react-dnd** + **react-dnd-html5-backend** | Board Kanban |
| Sắp thứ tự | **@kayron013/lexorank** | Thứ tự issue trong cột; cùng thuật toán với API |
| Command palette | **cmdk** | Tìm kiếm Ctrl+K |
| Thông báo | **sonner** | Toast |
| Ngày tháng | **date-fns**, **react-day-picker** | |
| Gọi API | `fetch` bọc trong `lib/api-client.ts` | |

### Backend
| Hạng mục | Công cụ | Lý do |
|---|---|---|
| Framework | **NestJS** (TypeScript) | Chia module rõ ràng (controller, service, DTO), hợp với làm nhóm |
| API | **REST** + **Swagger** (`@nestjs/swagger`) | Có tài liệu API tự sinh, FE tra cứu dễ dàng |
| Database | **PostgreSQL** (dev: Docker hoặc Neon) | Phổ biến, miễn phí trên cloud |
| ORM | **Prisma** | Viết schema dễ đọc, có migration, sinh type TS |
| Xác thực | **Passport + JWT** (`@nestjs/jwt`), mã hóa mật khẩu bằng **bcrypt** | Cách chuẩn trong NestJS |
| Validate | **zod** (`nestjs-zod`) | Dùng chung schema với frontend qua `packages/shared` (zod v3) |
| Test | **Jest** + **Supertest** | Mặc định của NestJS |

### API endpoint (MVP)
```
POST   /auth/register        POST /auth/login        GET /auth/me
GET    /projects             POST /projects          GET|PATCH|DELETE /projects/:id
GET    /issues?projectId&status&priority&assigneeId&q
POST   /issues               GET|PATCH|DELETE /issues/:id
PATCH  /issues/:id/move      # đổi status + rank khi kéo thả
GET    /users                GET /labels
```

### Data model (bản nháp)
```
User      (id, name, email, passwordHash, avatarUrl)
Project   (id, name, icon, color, ownerId → User)
Issue     (id, identifier, title, description, status, priority,
           rank, projectId → Project, assigneeId → User?, createdAt, updatedAt)
Label     (id, name, color)
IssueLabel(issueId, labelId)
```
- `status`: `BACKLOG | TODO | IN_PROGRESS | DONE | CANCELED`
- `priority`: `NO_PRIORITY | URGENT | HIGH | MEDIUM | LOW`
- `rank`: chuỗi lexorank để giữ thứ tự khi kéo thả

### Công cụ phát triển
- **pnpm**: package manager
- **ESLint** + **Prettier**; **husky** + **lint-staged**
- **Jest** (API), **Playwright** (E2E, chỉ các luồng chính)
- **Docker Compose**: PostgreSQL ở máy local
- **GitHub Actions**: CI; **Vercel**: deploy

---

## Cấu trúc thư mục

```
evolve_web/
├── apps/
│   ├── web/                        # Frontend: Next.js 15
│   │   ├── app/
│   │   │   ├── (auth)/login/  (auth)/register/
│   │   │   ├── (main)/issues/  issues/[id]/  projects/  projects/[id]/
│   │   │   ├── (main)/layout.tsx   # layout có sidebar
│   │   │   └── globals.css         # theme taalas
│   │   ├── components/
│   │   │   ├── ui/                 # shadcn components
│   │   │   ├── layout/             # sidebar, header
│   │   │   ├── issues/             # issue-line, issue-list, issue-board, selectors, modal…
│   │   │   ├── projects/           # project-line, project-list, project modal
│   │   │   └── common/             # status-icon, priority-icon, user-avatar, empty-state
│   │   ├── store/                  # Zustand: issues, projects, filter, auth, ui
│   │   ├── hooks/                  # hook dùng chung
│   │   └── lib/                    # api-client, utils
│   │
│   └── api/                        # Backend: NestJS
│       ├── src/
│       │   ├── modules/            # auth/ users/ projects/ issues/ labels/
│       │   ├── prisma/             # PrismaService
│       │   ├── common/             # filters, interceptors, decorators
│       │   └── main.ts
│       └── prisma/                 # schema.prisma, migrations/, seed.ts
│
├── packages/
│   └── shared/      # type (Issue, Project…) + zod schema + hằng số status/priority
│                    #   dùng chung cho web và api
├── docs/            # ROLES.md, TIMELINE.md, architecture/, api/, database/
├── docker-compose.yml
├── pnpm-workspace.yaml
└── README.md
```

---

## Phân công (nhóm 3 người)

| Thành viên | Vai trò | Phụ trách |
|---|---|---|
| **A (nhóm trưởng)** | Tech Lead, UI & DevOps | Monorepo, contract, design system, layout, auth và projects (FE), deploy, báo cáo |
| **B** | Backend | `apps/api`: Prisma, auth, projects, issues, labels, Swagger, test API |
| **C** | Frontend | Tính năng issues: list, modal, selector, board, chi tiết, filter/search |

- Phân vai chi tiết và quy tắc làm việc: [docs/ROLES.md](docs/ROLES.md)
- Milestone và task từng tuần: [docs/TIMELINE.md](docs/TIMELINE.md)
