# apps/web/store: Quản lý state (Zustand)

> Copy vào `apps/web/store/README.md` · Người điền: **C**

## Mục đích
Giữ **dữ liệu và trạng thái** của ứng dụng. Store là **nơi duy nhất gọi API** (qua `lib/api-client`); component chỉ đọc state và gọi hàm của store.

## File dự kiến
| File | Quản lý | Hàm chính (dự kiến) | Người làm · Task |
|---|---|---|---|
| `issues-store.ts` | Danh sách issue | `fetchIssues`, `addIssue`, `updateIssue`, `deleteIssue`, `moveIssue`, `getIssueById` | C · W2-C1, W4-C1 |
| `projects-store.ts` | Danh sách project | `fetchProjects`, `addProject`, `updateProject`, `deleteProject` | A · W4-A1 |
| `auth-store.ts` | Người dùng, token | `login`, `register`, `logout`, `fetchMe` | A · W3-A2 |
| `filter-store.ts` | Bộ lọc đang chọn (nếu không lưu hết lên URL) | `setFilter`, `clearFilters` | A · W5-A3 |
| `ui-store.ts` | Trạng thái giao diện: modal mở/đóng, sidebar | `openCreateIssue`, `closeCreateIssue` | C · W3-C2 |

## Mẫu store
```ts
// TODO(C): dán mẫu store chuẩn sau khi viết xong issues-store
```

## Quy ước
- Một store cho một miền dữ liệu.
- Hàm sửa dữ liệu phải: cập nhật state → gọi API → nếu lỗi thì hoàn tác và hiện toast.
- Mỗi store có `isLoading` và `error` nếu có gọi API.
<!-- TODO(C): bổ sung -->
