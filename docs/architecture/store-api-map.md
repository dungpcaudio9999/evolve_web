# Bản đồ store ↔ API

> Người phụ trách: **C** · Viết ở W2-C3 · B đối chiếu khi làm API (W3–W5)

Mỗi hàm trong store của `apps/web` sẽ gọi endpoint nào của `apps/api` khi chuyển từ dữ liệu mẫu sang API (W4-C1). **Tên và tham số các hàm giữ nguyên**; chỉ phần thân đổi từ sửa mảng trong bộ nhớ sang gọi API.

## `store/issues-store.ts`
| Hàm store | Endpoint | Body / query (schema trong `@evolve/shared`) | Trả về | Trạng thái |
|---|---|---|---|---|
| `fetchIssues()` *(thêm ở W4-C1)* | `GET /issues` | `issueFilterSchema` (query) | `Issue[]` | Chưa có |
| `addIssue(input)` | `POST /issues` | `createIssueSchema` | `Issue` | Dữ liệu mẫu |
| `updateIssue(id, patch)` | `PATCH /issues/:id` | `updateIssueSchema` | `Issue` | Dữ liệu mẫu |
| `setStatus(id, status)` | `PATCH /issues/:id` | `{ status }` | `Issue` | Dữ liệu mẫu |
| `moveIssue(id, input)` | `PATCH /issues/:id/move` | `moveIssueSchema` (`status`, `afterId`, `beforeId`) | `Issue` | Dữ liệu mẫu |
| `deleteIssue(id)` | `DELETE /issues/:id` | – | `204` | Dữ liệu mẫu |
| `users` (dữ liệu tham chiếu) | `GET /users` | – | `User[]` | Dữ liệu mẫu |
| `labels` (dữ liệu tham chiếu) | `GET /labels` | – | `Label[]` | Dữ liệu mẫu |
| `projects` (dữ liệu tham chiếu) | `GET /projects` | – | `Project[]` | Dữ liệu mẫu, chuyển sang `projects-store` ở W4-A1 |

## Các store khác (dự kiến)
| Store | Hàm | Endpoint | Task |
|---|---|---|---|
| `auth-store.ts` | `register`, `login`, `fetchMe`, `logout` | `POST /auth/register`, `POST /auth/login`, `GET /auth/me` | W3-A2 |
| `projects-store.ts` | `fetchProjects`, `addProject`, `updateProject`, `deleteProject` | `GET/POST /projects`, `PATCH/DELETE /projects/:id` | W4-A1 |

## Quy ước khi nối API
1. Cập nhật state **trước** (giao diện phản hồi ngay), gọi API sau; lỗi thì hoàn tác và hiện toast.
2. Dùng dữ liệu API trả về (`Issue`) để thay bản tạm trong state (lấy `id`, `identifier`, `rank` thật).
3. `rank` do API tính khi `moveIssue`; web chỉ tính tạm để hiển thị ngay.
