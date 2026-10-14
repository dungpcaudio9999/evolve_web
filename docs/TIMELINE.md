# Timeline dự án: Evolve Web

> 6 tuần · 3 người · khoảng 8 giờ/người/tuần
> Phân vai: [ROLES.md](./ROLES.md) · Kế hoạch tổng: [../PLAN.md](../PLAN.md)

**Ký hiệu:** **A** = nhóm trưởng (Tech Lead, UI & DevOps) · **B** = Backend · **C** = Frontend
Mã task có dạng `W<tuần>-<người><số>`, ví dụ `W3-B1`. Dùng mã này để đặt tên issue và branch.
Đường dẫn file frontend tính từ `apps/web/`, backend tính từ `apps/api/`.

## Tổng quan

| Tuần | Chủ đề | Milestone |
|---|---|---|
| 1 | Nền tảng | **M1:** Repo chạy được, contract đã chốt, `apps/web` và `apps/api` khởi tạo xong |
| 2 | Giao diện nền và database | **M2:** Layout đúng theme taalas; trang Issues dạng list chạy với dữ liệu mẫu; DB có dữ liệu seed |
| 3 | Auth và tạo issue | **M3:** Đăng ký/đăng nhập chạy end-to-end; tạo và sửa issue trên giao diện |
| 4 | Nối API | **M4:** Issue và project lưu vào DB; trang chi tiết issue |
| 5 | Board và deploy | **M5:** Đủ MVP: board kéo thả, filter, tìm kiếm; đã deploy online |
| 6 | Kiểm thử và nộp | **M6:** Đã sửa bug, có báo cáo và slide, sẵn sàng demo |

---

## Tuần 1: Nền tảng

**Milestone M1:** `pnpm install && pnpm dev` chạy được `apps/web` (trang trống có shadcn) và `apps/api` (`GET /health`). `packages/shared` đã được cả nhóm duyệt.

| Mã | Người | Task | Giờ | Phụ thuộc | Tiêu chí xong |
|---|---|---|---|---|---|
| W1-A1 | A | Tạo repo GitHub, GitHub Projects, nhãn, template PR | 1 | – | Board có cột Todo / In Progress / Review / Done |
| W1-A2 | A | Dựng monorepo: `pnpm-workspace.yaml`, `package.json` gốc, script `dev`/`build`/`lint` | 2 | W1-A1 | `pnpm install` chạy được ở thư mục gốc |
| W1-A3 | A | `docker-compose.yml` (PostgreSQL), `.env.example` | 1 | W1-A2 | `docker compose up` chạy được Postgres |
| W1-A4 | A | `packages/shared`: type `Issue`, `Project`, `User`, `Label`; hằng số `STATUSES`, `PRIORITIES`; zod schema tạo/sửa issue, project, đăng ký/đăng nhập | 3 | W1-A2 | Import được từ cả web lẫn api |
| W1-B1 | B | Học NestJS (module, controller, service, DTO) và Prisma | 4 | – | Làm xong một CRUD mẫu ở máy cá nhân |
| W1-B2 | B | Khởi tạo `apps/api` (NestJS) trong monorepo, `GET /health` | 2 | W1-A2 | `GET /health` trả về 200 |
| W1-B3 | B | Review contract, góp ý về các trường cần lưu trong DB | 1 | W1-A4 | Đã comment trên PR contract |
| W1-C1 | C | Khởi tạo `apps/web`: Next.js 15, TypeScript, Tailwind v4, ESLint, Prettier | 2 | W1-A2 | `pnpm dev` chạy được web |
| W1-C2 | C | Cài shadcn/ui; thêm `components/ui/`: button, input, textarea, dialog, dropdown-menu, popover, context-menu, command, avatar, badge, tooltip, separator | 2 | W1-C1 | Trang `/dev/ui` hiển thị đủ component |
| W1-C3 | C | `components/common/`: `status-icon`, `priority-icon`, `user-avatar` (dùng hằng số từ `packages/shared`) | 2 | W1-A4 | Hiển thị đúng 5 trạng thái và 5 độ ưu tiên |
| W1-C4 | C | Review contract theo góc nhìn giao diện | 1 | W1-A4 | Đã comment trên PR contract |
| W1-ALL | Cả nhóm | Họp kickoff: thống nhất quy tắc, **chốt contract** | 1 | – | Đã merge PR contract |

---

## Tuần 2: Giao diện nền và database

**Milestone M2:** Có layout với sidebar, đúng màu và font taalas. Trang `/issues` hiển thị list nhóm theo trạng thái với dữ liệu mẫu. Database đã migrate và có dữ liệu seed.

| Mã | Người | Task | Giờ | Phụ thuộc | Tiêu chí xong |
|---|---|---|---|---|---|
| W2-A1 | A | CI GitHub Actions: lint, typecheck, build cho web, api, shared | 2 | W1-A2 | CI xanh trên PR |
| W2-A2 | A | Design system trong `app/globals.css`: nền `#101522`, primary `#E8B07C`, màu phụ, viền, bo góc; class `text-gradient` | 2 | W1-C2 | Component shadcn hiển thị đúng màu |
| W2-A3 | A | Font Panchang (local) + Poppins (Google) qua `next/font` | 1 | W2-A2 | Tiêu đề dùng Panchang, nội dung dùng Poppins |
| W2-A4 | A | `app/(main)/layout.tsx`, `components/layout/sidebar.tsx` (logo, Issues, Projects), `header.tsx` | 2 | W2-A2 | Điều hướng giữa các trang được |
| W2-B1 | B | `schema.prisma`: User, Project, Issue, Label, IssueLabel; enum status/priority; trường `rank` | 3 | W1-A4 | `prisma migrate dev` chạy thành công |
| W2-B2 | B | `seed.ts`: 3 users, 2 projects, khoảng 30 issues, 5 labels | 2 | W2-B1 | DB có dữ liệu, xem được bằng Prisma Studio |
| W2-B3 | B | `PrismaService`, cấu hình module, exception filter, CORS | 2 | W2-B1 | API kết nối được DB |
| W2-C1 | C | Dữ liệu mẫu `lib/sample-data.ts` (đúng type trong `packages/shared`); `store/issues-store.ts` (Zustand): danh sách, thêm, sửa, xóa, đổi trạng thái | 3 | W1-A4 | Gọi được các hàm của store từ component |
| W2-C2 | C | `components/issues/issue-line.tsx`: identifier, priority, status, tiêu đề, labels, assignee, ngày | 2 | W1-C3 | Một dòng hiển thị đủ thông tin |
| W2-C3 | C | `components/issues/issue-list.tsx`: nhóm theo trạng thái, header có số lượng, thu gọn được; trang `app/(main)/issues/page.tsx` | 2 | W2-C1, W2-C2, W2-A4 | M2: list hiển thị trong layout |
| W2-ALL | Cả nhóm | Họp tuần, demo M2 | 1 | – | – |

---

## Tuần 3: Auth và tạo issue

**Milestone M3:** Đăng ký và đăng nhập trên web, nhận JWT, vào được trang Issues; chưa đăng nhập thì bị chuyển về `/login`. Trên giao diện tạo được issue, đổi được status/priority/assignee (chưa cần lưu DB).

| Mã | Người | Task | Giờ | Phụ thuộc | Tiêu chí xong |
|---|---|---|---|---|---|
| W3-A1 | A | `app/(auth)/login`, `app/(auth)/register` (react-hook-form + zod, layout riêng không có sidebar) | 3 | W2-A2 | Validate đúng, hiện lỗi |
| W3-A2 | A | `store/auth-store.ts`; nối login/register với API; lưu token; route guard; menu người dùng có nút đăng xuất | 3 | W3-A1, W3-B1, W3-C3 | Luồng đăng nhập chạy end-to-end |
| W3-A3 | A | Chỉnh nút dạng viên thuốc, card, chữ gradient cho tiêu đề trang; logo, favicon | 1 | W2-A2 | Đúng phong cách taalas |
| W3-B1 | B | Module auth: register, login (bcrypt, JWT), `GET /auth/me`, JWT guard | 4 | W2-B3 | Gọi thử được trên Swagger |
| W3-B2 | B | Module projects: CRUD, chỉ thấy project của mình | 2 | W3-B1 | Test thủ công trên Swagger |
| W3-B3 | B | Cài Swagger (`/docs`) | 1 | W2-B3 | `/docs` hiển thị đủ endpoint |
| W3-C1 | C | `status-selector`, `priority-selector`, `assignee-selector` (popover + command, có tìm kiếm) | 3 | W2-C2 | Đổi được giá trị ngay trên `issue-line` |
| W3-C2 | C | `create-issue-modal.tsx` (react-hook-form + zod): tiêu đề, mô tả, status, priority, assignee, project; phím tắt `C` | 3 | W3-C1 | Tạo issue mới, hiện ngay trong list |
| W3-C3 | C | `lib/api-client.ts`: base URL, gắn token, xử lý lỗi bằng toast (sonner) | 1 | – | A và C dùng được |
| W3-ALL | Cả nhóm | Họp tuần, demo M3 | 1 | – | – |

---

## Tuần 4: Nối API

**Milestone M4:** Tạo, sửa, xóa issue và project trên web; dữ liệu lưu vào DB và vẫn còn khi tải lại trang. Có trang chi tiết issue.

| Mã | Người | Task | Giờ | Phụ thuộc | Tiêu chí xong |
|---|---|---|---|---|---|
| W4-A1 | A | `store/projects-store.ts`; `components/projects/`: `project-line`, `project-list`, `create-project-modal` | 3 | W3-B2 | Hiển thị và tạo project |
| W4-A2 | A | Trang `/projects` và `/projects/[id]` (list issue của project, dùng lại `issue-list`) | 2 | W4-A1, W4-C1 | Sửa và xóa project được; xem issue theo project |
| W4-A3 | A | Kiểm tra cùng B: mỗi người dùng chỉ thấy dữ liệu của mình; review PR | 3 | W3-A2 | Đăng nhập 2 tài khoản khác nhau thấy dữ liệu khác nhau |
| W4-B1 | B | Module issues: CRUD; filter `projectId`, `status`, `priority`, `assigneeId`, `q`; tự sinh `identifier` | 5 | W3-B1 | Swagger đầy đủ |
| W4-B2 | B | Module users, labels (chỉ đọc) | 1 | W2-B3 | – |
| W4-B3 | B | Test API cho auth (Jest + Supertest) | 2 | W3-B1 | `pnpm test` xanh |
| W4-C1 | C | Chuyển `issues-store` sang gọi API (`GET/POST/PATCH/DELETE /issues`); trạng thái đang tải | 3 | W4-B1, W3-C3 | Thay đổi vẫn còn sau khi tải lại |
| W4-C2 | C | `issue-context-menu.tsx` (xóa, đổi status/priority bằng chuột phải); `label-selector` + `label-badge` | 2 | W4-C1, W4-B2 | Xóa có hộp thoại xác nhận |
| W4-C3 | C | Trang `/issues/[id]`: sửa tiêu đề, mô tả; panel thuộc tính bên phải dùng lại các selector | 3 | W4-C1 | Sửa xong được lưu vào DB |
| W4-ALL | Cả nhóm | Họp tuần, demo M4; **quyết định cắt phạm vi nếu trễ** | 1 | – | – |

---

## Tuần 5: Board và deploy

**Milestone M5 (đủ MVP):** Board kéo thả đổi được trạng thái và thứ tự, lưu vào DB. Filter và tìm kiếm chạy được. Có link web và API online.

| Mã | Người | Task | Giờ | Phụ thuộc | Tiêu chí xong |
|---|---|---|---|---|---|
| W5-A1 | A | Tạo Neon DB; deploy API lên Render (cùng B) | 2 | W4-B1 | `GET /health` online trả về 200 |
| W5-A2 | A | Deploy web lên Vercel; biến môi trường; CORS | 2 | W5-A1 | Đăng nhập được trên link online |
| W5-A3 | A | `components/issues/filter-bar.tsx`: lọc theo status/priority/assignee/project, lưu lên URL (nuqs) | 3 | W4-C1 | Lọc đúng, giữ nguyên bộ lọc khi tải lại |
| W5-B1 | B | `PATCH /issues/:id/move`: đổi status + tính `rank` bằng lexorank | 3 | W4-B1 | Thứ tự giữ đúng sau khi tải lại |
| W5-B2 | B | Test API cho issues (CRUD, move) | 2 | W5-B1 | `pnpm test` xanh |
| W5-B3 | B | Migrate và seed trên Neon; hỗ trợ deploy | 2 | W5-A1 | DB online có dữ liệu |
| W5-C1 | C | `issue-board.tsx`, `board-column.tsx`, `board-card.tsx` (react-dnd); nút chuyển list/board (nuqs) | 3 | W4-C1 | Board hiển thị 5 cột theo trạng thái |
| W5-C2 | C | Kéo thả gọi `PATCH /issues/:id/move`: cập nhật giao diện trước, gọi API sau, lỗi thì trả về vị trí cũ | 2 | W5-C1, W5-B1 | Kéo thả mượt, không bị nhảy |
| W5-C3 | C | `search-command.tsx`: Ctrl+K (cmdk) tìm issue theo từ khóa, Enter để mở chi tiết | 2 | W4-C1 | Tìm và mở được issue |
| W5-ALL | Cả nhóm | Họp tuần, **demo M5 trên link online** | 1 | – | – |

---

## Tuần 6: Kiểm thử và nộp

**Milestone M6:** Không còn bug nghiêm trọng; có test E2E cho các luồng chính; báo cáo và slide hoàn chỉnh; đã tập demo.

| Mã | Người | Task | Giờ | Phụ thuộc | Tiêu chí xong |
|---|---|---|---|---|---|
| W6-A1 | A | Test E2E (Playwright): đăng nhập → tạo issue → kéo thả | 2 | M5 | Test chạy xanh |
| W6-A2 | A | Tổ chức test tay theo checklist (cả nhóm), ghi bug lên board; README | 2 | M5 | Danh sách bug; README đầy đủ |
| W6-A3 | A | Báo cáo: giới thiệu, kiến trúc, phân công; ghép phần của B và C; slide | 3 | – | Bản hoàn chỉnh |
| W6-B1 | B | Sửa bug backend; tối ưu query; kiểm tra phân quyền | 3 | W6-A2 | Bug backend đã đóng |
| W6-B2 | B | `docs/api/`, `docs/database/` (ERD); phần backend trong báo cáo | 3 | – | – |
| W6-C1 | C | Sửa bug UI; responsive; `empty-state` cho list, board, projects | 4 | W6-A2 | Bug UI đã đóng; dùng được trên mobile |
| W6-C2 | C | Phần frontend trong báo cáo; chụp ảnh màn hình | 2 | – | – |
| W6-ALL | Cả nhóm | Tập demo (gọi `/health` trước để đánh thức Render), chốt báo cáo | 1 | – | Sẵn sàng nộp |

---

## Tổng giờ theo người

| Tuần | A | B | C |
|---|---|---|---|
| 1 | 8 | 8 | 8 |
| 2 | 8 | 8 | 8 |
| 3 | 8 | 8 | 8 |
| 4 | 9 | 9 | 9 |
| 5 | 8 | 8 | 8 |
| 6 | 8 | 7 | 7 |
| **Tổng** | **49** | **48** | **48** |

## Nếu bị trễ: thứ tự cắt phạm vi

Quyết định ở buổi họp tuần 4. Cắt lần lượt theo thứ tự:
1. Test E2E (W6-A1), thay bằng test tay theo checklist
2. Labels (`label-selector`, API labels)
3. Tìm kiếm Ctrl+K (W5-C3), chỉ giữ filter
4. Trang `/projects/[id]`: chỉ giữ danh sách project

**Không được cắt:** đăng nhập, CRUD issue, board kéo thả, deploy.
