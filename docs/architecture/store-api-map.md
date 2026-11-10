# Bản đồ store ↔ API

> Người phụ trách: **C** · Viết ở W2-C3 · B đối chiếu khi làm API (W3–W5)

Mỗi hàm trong store của `apps/web` gọi endpoint nào của `apps/api`. Từ W4-C1 store đã gọi API thật; **tên và tham số các hàm giữ như W2–W3** (riêng `addIssue`, `updateIssue`, `deleteIssue`, `setStatus` thành `async`).

## `store/issues-store.ts`
| Hàm store | Endpoint | Body / query (schema trong `@evolve/shared`) | Trả về | Trạng thái |
|---|---|---|---|---|
| `fetchIssues(filter?)` | `GET /issues` | `issueFilterSchema` (query) | `Issue[]` | ✅ W4-C1 |
| `fetchIssue(id)` | `GET /issues/:id` | – | `Issue` (404 → `null`) | ✅ W4-C1 |
| `addIssue(input)` | `POST /issues` | `createIssueSchema` | `Issue` | ✅ W4-C1 |
| `updateIssue(id, patch)` | `PATCH /issues/:id` | `updateIssueSchema` | `Issue` | ✅ W4-C1 |
| `setStatus(id, status)` | `PATCH /issues/:id` | `{ status }` | `Issue` | ✅ W4-C1 |
| `moveIssue(id, input)` | `PATCH /issues/:id/move` | `moveIssueSchema` (`status`, `afterId`, `beforeId`) | `Issue` | Chỉ trên trình duyệt; API ở W5 |
| `deleteIssue(id)` | `DELETE /issues/:id` | – | `204` | ✅ W4-C1 |
| `fetchMeta()` → `users` | `GET /users` | – | `User[]` | ✅ W4-C1 |
| `fetchMeta()` → `labels` | `GET /labels` | – | `Label[]` | ✅ W4-C1 |
| ~~`projects`~~ | – | – | – | Chuyển sang `projects-store` (W4-A1, W4-C1) |

## Các store khác (dự kiến)
| Store | Hàm | Endpoint | Task |
|---|---|---|---|
| `auth-store.ts` | `register`, `login`, `init`, `logout` | `POST /auth/register`, `POST /auth/login`, `GET /auth/me` | ✅ W3-A2 |
| `projects-store.ts` | `fetchProjects`, `addProject`, `updateProject`, `deleteProject` | `GET/POST /projects`, `PATCH/DELETE /projects/:id` | ✅ W4-A1 |

## Quy ước khi nối API
1. Cập nhật state **trước** (giao diện phản hồi ngay), gọi API sau; lỗi thì hoàn tác và hiện toast.
2. Dùng dữ liệu API trả về (`Issue`) để thay bản tạm trong state (lấy `id`, `identifier`, `rank` thật).
3. `rank` do API tính khi `moveIssue`; web chỉ tính tạm để hiển thị ngay.
