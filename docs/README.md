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
| [W1/W1-A_TONG_KET.md](W1/W1-A_TONG_KET.md) | Tổng kết tuần 1 |
| [W2/README.md](W2/README.md) | Báo cáo tuần 2 |
| [W3/README.md](W3/README.md) | Báo cáo tuần 3 |
| [W3/HUONG_DAN.md](W3/HUONG_DAN.md) | Tuần 3: hướng dẫn chạy, dùng thử, phát triển tiếp, lỗi thường gặp |
| [W3/NHAT_KY.md](W3/NHAT_KY.md) | Tuần 3: nhật ký quá trình thực hiện |
| [W4/README.md](W4/README.md) | Báo cáo tuần 4 |
| [W4/HUONG_DAN.md](W4/HUONG_DAN.md) | Tuần 4: dùng thử tính năng mới, API issues, phát triển tiếp, lỗi thường gặp 12–17 |
| [W4/NHAT_KY.md](W4/NHAT_KY.md) | Tuần 4: nhật ký quá trình thực hiện |

## Thư mục con
| Thư mục | Vai trò | Người phụ trách | File dự kiến |
|---|---|---|---|
| `architecture/` | Kiến trúc hệ thống, quyết định kỹ thuật | A | `overview.md` (sơ đồ web ↔ api ↔ DB), [`store-api-map.md`](architecture/store-api-map.md) ✅ (store nào gọi endpoint nào), `frontend.md` (C), `deployment.md` |
| `api/` | Tài liệu REST API | B | `endpoints.md` (danh sách endpoint, request/response mẫu), `auth.md` (luồng JWT) |
| `database/` | Thiết kế database | B | `erd.md` hoặc `erd.png` (sơ đồ quan hệ), `models.md` (mô tả bảng và trường) |
