# Phân vai nhóm: Evolve Web

> Nhóm 3 người · 6 tuần · khoảng 8 giờ/người/tuần
> Timeline chi tiết: [TIMELINE.md](./TIMELINE.md) · Kế hoạch tổng: [../PLAN.md](../PLAN.md)

| Mã | Thành viên | Vai trò | Phụ trách chính |
|---|---|---|---|
| **A** | _(tên)_, nhóm trưởng | Tech Lead, UI & DevOps | Repo, contract, design system, layout, FE auth và projects, deploy, báo cáo |
| **B** | _(tên)_ | Backend Developer | `apps/api`: NestJS, Prisma, PostgreSQL |
| **C** | _(tên)_ | Frontend Developer | Các tính năng issues trong `apps/web` |

---

## Hướng tiếp cận chung

- **Contract trước:** `packages/shared` (type, zod schema, hằng số status/priority) là "hợp đồng" giữa frontend và backend, được chốt ở tuần 1. Muốn thay đổi contract thì phải báo cả nhóm và cần A duyệt.
- **Làm song song:** frontend dùng dữ liệu mẫu (cùng dạng với contract) cho đến khi API sẵn sàng, rồi chuyển sang gọi API thật. Component không phụ thuộc vào nguồn dữ liệu: chỉ store biết dữ liệu đến từ đâu.
- **Công cụ:** xem mục Tech stack trong [PLAN.md](../PLAN.md). Không tự ý thêm thư viện mới khi chưa hỏi A.

---

## A: Nhóm trưởng · Tech Lead, UI & DevOps

### Trách nhiệm
**Quản lý dự án**
- Tạo và quản lý GitHub Projects (board task); chia task đầu mỗi tuần.
- Chủ trì họp tuần; theo dõi tiến độ so với các mốc; quyết định cắt phạm vi khi trễ.
- Review và merge PR vào `dev`; cuối mỗi tuần merge `dev → main` (release).

**Nền tảng**
- Dựng monorepo (pnpm workspaces), `docker-compose.yml`, `.env.example`, CI (GitHub Actions).
- Viết **contract** `packages/shared`: type `Issue`, `Project`, `User`, `Label`, `Status`, `Priority`; zod schema; hằng số.

**Giao diện chung**
- **Design system taalas** trong `app/globals.css`: màu, font Panchang + Poppins, chữ gradient, nút dạng viên thuốc, bo góc.
- **Layout:** `(main)/layout.tsx`, `components/layout/` (sidebar có Issues và Projects, header, menu người dùng).

**Tính năng**
- **Auth (FE):** trang `/login`, `/register`; `store/auth-store.ts`; lưu token; bảo vệ route; đăng xuất.
- **Projects (FE):** `components/projects/`, trang `/projects` và `/projects/[id]`, `store/projects-store.ts`.
- **Filter bar:** lọc theo status/priority/assignee, lưu lên URL bằng nuqs.

**Triển khai và kiểm thử**
- Deploy: Vercel (web), Render (api), Neon (DB); cấu hình biến môi trường.
- Test E2E (Playwright) cho các luồng chính.

**Tài liệu**
- `README.md` (cài đặt, chạy, deploy), `docs/architecture/`.
- Chủ biên báo cáo và slide; ghép phần viết của B và C.

### Sản phẩm bàn giao
Repo chạy được bằng một lệnh · `packages/shared` · design system và layout · trang login/register · trang Projects · filter bar · link deploy · báo cáo và slide.

### Kỹ năng cần có
Next.js App Router, Tailwind v4 / CSS variables, shadcn/ui, Zustand, nuqs, Git, GitHub Actions, Vercel/Render.

---

## B: Backend Developer

### Trách nhiệm
**Database**
- `prisma/schema.prisma`: User, Project, Issue, Label, IssueLabel; enum status/priority; trường `rank` để sắp thứ tự.
- Migration; `seed.ts` sinh dữ liệu mẫu (users, projects, khoảng 30 issue, labels).

**API (NestJS)**
- Module `auth`: register, login (JWT), `GET /auth/me`, JWT guard, mã hóa mật khẩu bằng bcrypt.
- Module `projects`: CRUD; mỗi người dùng chỉ thấy project của mình.
- Module `issues`: CRUD; filter theo `projectId`, `status`, `priority`, `assigneeId`, `q`; tự sinh `identifier` (ví dụ `EVO-12`); `PATCH /issues/:id/move` (status + lexorank).
- Module `users`, `labels`: chỉ cần đọc.
- Validate bằng zod (`nestjs-zod`) với schema lấy từ `packages/shared`.
- Bắt lỗi thống nhất (exception filter), CORS, endpoint `GET /health`.

**Chất lượng**
- Swagger (`/docs`) luôn cập nhật theo code.
- Test API bằng Jest + Supertest cho auth và issues.
- Deploy API lên Render cùng A.

**Tài liệu**
- `docs/api/`, `docs/database/` (ERD); phần backend trong báo cáo.

### Sản phẩm bàn giao
API chạy được ở local và trên Render · Swagger · migration và seed · test API · ERD.

### Kỹ năng cần có
NestJS (module, controller, service, guard), Prisma, PostgreSQL, JWT. **Tuần 1 dành thời gian học** theo tài liệu chính thức của NestJS và Prisma.

---

## C: Frontend Developer

### Trách nhiệm
**Nền tảng frontend**
- Khởi tạo `apps/web`: Next.js 15, Tailwind v4, shadcn/ui; thêm các component UI cần dùng (button, input, textarea, dialog, dropdown-menu, popover, context-menu, command, avatar, badge, tooltip, separator).
- `components/common/`: `status-icon`, `priority-icon`, `user-avatar`, `empty-state`.
- `lib/api-client.ts`: bọc `fetch`, gắn token, xử lý lỗi và hiện toast (sonner).

**Tính năng issues**
- `store/issues-store.ts` (Zustand): danh sách issue, thêm, sửa, xóa, đổi trạng thái, lọc; ban đầu dùng dữ liệu mẫu, sau chuyển sang gọi API.
- **List:** `issue-line`, `issue-list` nhóm theo trạng thái, có thể thu gọn từng nhóm.
- **Selector:** `status-selector`, `priority-selector`, `assignee-selector`, `label-selector` (popover + command).
- **Tạo/sửa:** `create-issue-modal` (react-hook-form + zod), phím tắt `C`.
- **Xóa:** `issue-context-menu` (chuột phải).
- **Chi tiết:** trang `/issues/[id]`: sửa tiêu đề, mô tả và các thuộc tính.
- **Board:** `issue-board`, `board-column`, `board-card` bằng react-dnd. Khi thả: cập nhật giao diện trước, gọi `PATCH /issues/:id/move` sau, nếu lỗi thì trả issue về vị trí cũ.
- **Tìm kiếm:** command palette Ctrl+K (cmdk).
- **Chuyển chế độ list/board** (lưu lên URL bằng nuqs).

**Hoàn thiện giao diện**
- Responsive (360px đến 1440px), trạng thái rỗng, trạng thái đang tải.

**Tài liệu**
- Phần frontend trong báo cáo: cấu trúc component, cách store gọi API.

### Sản phẩm bàn giao
`apps/web` khởi tạo xong · component UI và common · `api-client` · `issues-store` · list, modal, selector, chi tiết, board, tìm kiếm hoạt động với API thật.

### Kỹ năng cần có
React 19, Next.js App Router, TypeScript, Zustand, react-hook-form, react-dnd, shadcn/ui.

---

## Ma trận trách nhiệm (RACI)

R = làm · A = duyệt / chịu trách nhiệm cuối · C = được hỏi ý kiến · I = được thông báo

| Hạng mục | A | B | C |
|---|---|---|---|
| Monorepo, CI | R/A | I | I |
| Contract `packages/shared` | R/A | C | C |
| Khởi tạo `apps/web`, component UI | A | – | R |
| Design system, layout, sidebar | R/A | – | C |
| Database, seed | A | R | I |
| API auth / projects / issues | A | R | C |
| FE auth, FE projects, filter bar | R/A | C | C |
| FE issues: list, modal, selector, chi tiết, board, search | A | C | R |
| Deploy | R/A | R | I |
| Test API | A | R | – |
| Test E2E | R/A | – | C |
| Báo cáo, slide | R/A | R | R |

---

## Quy tắc làm việc

### Git
Quy trình chi tiết: [EVOLVE_WEB_TEAM_WORKFLOW.vi.md](./EVOLVE_WEB_TEAM_WORKFLOW.vi.md) (tiếng Việt) · [EVOLVE_WEB_TEAM_WORKFLOW.md](./EVOLVE_WEB_TEAM_WORKFLOW.md) (English). Tóm tắt:
- Branch `main` (ổn định) ← `dev` (tích hợp) ← `feature/<mã-task>-<tên>`, ví dụ `feature/W3-B1-auth-api`.
- Mọi PR vào `dev`: CI xanh, 1 người approve (PR của A do B hoặc C review), squash and merge.
- Cuối mỗi tuần, A merge `dev → main` khi đạt milestone.
- Đổi contract (`packages/shared`) thì phải tag cả nhóm; chỉ B tạo migration Prisma.

### Giao tiếp
- **Họp tuần** (khoảng 1 giờ, cùng một giờ cố định mỗi tuần): demo việc đã xong, kiểm tra mốc, chia task tuần sau.
- **Cập nhật hằng ngày** qua nhóm chat, theo mẫu: `Hôm qua / Hôm nay / Vướng mắc`.
- Bị vướng quá **2 giờ** thì hỏi ngay, không ngồi chờ đến buổi họp.

### Definition of Done (task được coi là xong khi)
1. Code đã được merge vào `dev`, CI xanh.
2. Chạy đúng ở local với dữ liệu seed.
3. Giao diện đúng design system; API mới có trên Swagger; logic quan trọng có test.
4. Task trên GitHub Projects đã chuyển sang **Done**.
