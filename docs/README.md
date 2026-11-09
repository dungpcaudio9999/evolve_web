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
| `architecture/` | Kiến trúc hệ thống, quyết định kỹ thuật | A | `overview.md` (sơ đồ web ↔ api ↔ DB), [`store-api-map.md`](architecture/store-api-map.md) ✅ (store nào gọi endpoint nào), `frontend.md` (C), `deployment.md` |
| `api/` | Tài liệu REST API | B | `endpoints.md` (danh sách endpoint, request/response mẫu), `auth.md` (luồng JWT) |
| `database/` | Thiết kế database | B | `erd.md` hoặc `erd.png` (sơ đồ quan hệ), `models.md` (mô tả bảng và trường) |
