# docs/

> Người phụ trách: **A** (mục lục) · B và C cập nhật phần của mình

## Mục đích
Tập trung **toàn bộ tài liệu** của dự án: kế hoạch, phân công, quy trình, kiến trúc, API và database.

## Tài liệu quản lý dự án
| File | Nội dung |
|---|---|
| [../PLAN.md](../PLAN.md) | Kế hoạch tổng: yêu cầu, thiết kế, tech stack, cấu trúc |
| [ROLES.md](ROLES.md) | Phân vai chi tiết, ma trận trách nhiệm |
| [TIMELINE.md](TIMELINE.md) | Milestone và task theo tuần |
| [EVOLVE_WEB_TEAM_WORKFLOW.vi.md](EVOLVE_WEB_TEAM_WORKFLOW.vi.md) | Quy trình Git, PR, review (tiếng Việt) |
| [EVOLVE_WEB_TEAM_WORKFLOW.md](EVOLVE_WEB_TEAM_WORKFLOW.md) | Bản tiếng Anh |

## Thư mục con
| Thư mục | Vai trò | Người phụ trách | File dự kiến |
|---|---|---|---|
| `architecture/` | Kiến trúc hệ thống, quyết định kỹ thuật | A | `overview.md` (sơ đồ web ↔ api ↔ DB), `store-api-map.md` (store nào gọi endpoint nào; C viết ở W2-C3), `frontend.md` (C), `deployment.md` |
| `api/` | Tài liệu REST API | B | `endpoints.md` (danh sách endpoint, request/response mẫu), `auth.md` (luồng JWT) |
| `database/` | Thiết kế database | B | `erd.md` hoặc `erd.png` (sơ đồ quan hệ), `models.md` (mô tả bảng và trường) |
| `readme-templates/` | Khung README cho `apps/web` và `apps/api`, dùng sau khi khởi tạo app | A | Xem bên dưới |

## Khung README chờ dùng
Sau khi khởi tạo app (W1-C1, W1-B2), người phụ trách copy khung vào đúng vị trí rồi điền nội dung:

| Khung | Copy vào | Người điền |
|---|---|---|
| `readme-templates/web.md` | `apps/web/README.md` | C |
| `readme-templates/web-app.md` | `apps/web/app/README.md` | A |
| `readme-templates/web-components.md` | `apps/web/components/README.md` | C |
| `readme-templates/web-store.md` | `apps/web/store/README.md` | C |
| `readme-templates/web-lib.md` | `apps/web/lib/README.md` | C |
| `readme-templates/api.md` | `apps/api/README.md` | B |
| `readme-templates/api-modules.md` | `apps/api/src/modules/README.md` | B |
| `readme-templates/api-prisma.md` | `apps/api/prisma/README.md` | B |

Copy xong thì xóa khung tương ứng trong `readme-templates/`. Khi thư mục này trống thì xóa luôn.
