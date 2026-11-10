# apps/web/store: Quản lý state (Zustand)

> Người phụ trách: **C**

## Mục đích
Giữ **dữ liệu và trạng thái** của ứng dụng. Store là **nơi duy nhất gọi API** (qua `lib/api-client`); component chỉ đọc state và gọi hàm của store.

## File dự kiến
| File | Quản lý | Hàm chính (dự kiến) | Người làm · Task |
|---|---|---|---|
| `issues-store.ts` ✅ | Issue + users, labels **từ API**; `status` tải | `fetchIssues`, `fetchIssue`, `fetchMeta`, `addIssue`, `updateIssue`, `deleteIssue`, `setStatus` (async, cập nhật ngay rồi hoàn tác nếu API lỗi), `moveIssue` (local đến W5), `reset`; helper `groupByStatus` | C · W2-C1, W4-C1 |
| `projects-store.ts` ✅ | Danh sách project của người dùng (API), `status` tải | `fetchProjects`, `fetchProject`, `addProject`, `updateProject`, `deleteProject`, `reset` | A · W4-A1, W4-A2 |
| `auth-store.ts` ✅ | Người dùng, trạng thái đăng nhập (`idle`/`loading`/`authenticated`/`guest`) | `init` (gọi `/auth/me`), `login`, `register`, `logout(reason)`; đăng nhập/đăng xuất **xóa dữ liệu issue và project của người trước**; helper `safeNextPath` | A · W3-A2, W4-A3 |
| `filter-store.ts` | Bộ lọc đang chọn (nếu không lưu hết lên URL) | `setFilter`, `clearFilters` | A · W5-A3 |
| `ui-store.ts` ✅ | Trạng thái giao diện: modal tạo issue mở/đóng, project chọn sẵn (`createIssueProjectId`) | `openCreateIssue`, `closeCreateIssue`, `setCreateIssueOpen` | C · W3-C2 |

## Mẫu store
```ts
// Đọc trong component (chỉ chọn phần cần để tránh render lại thừa):
const issues = useIssuesStore((s) => s.issues);
const setStatus = useIssuesStore((s) => s.setStatus);
const groups = useMemo(() => groupByStatus(issues), [issues]);

// Gọi hàm:
setStatus(issue.id, 'DONE');
useIssuesStore.getState().addIssue({ title: 'Việc mới', projectId: 'p-evo' });
```

## Quy ước
- Một store cho một miền dữ liệu.
- Hàm sửa dữ liệu phải: cập nhật state → gọi API → nếu lỗi thì hoàn tác và hiện toast.
- Mỗi store có `isLoading` và `error` nếu có gọi API.
- Input được validate bằng zod schema của `@evolve/shared` (giống API) → sai thì ném `ZodError`.
- Thứ tự trong cột dùng `rank` (lexorank, `lib/rank.ts`), cùng thuật toán với API.
- Khi đổi sang API (W4-C1): **giữ nguyên tên và tham số các hàm** để component không phải sửa.
- Test: `store/*.test.ts` (Vitest), chạy `pnpm --filter web test`.
