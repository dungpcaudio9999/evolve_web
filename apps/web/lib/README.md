# apps/web/lib: Tiện ích

> Người phụ trách: **C**

## Mục đích
Chứa **code không phải component và không phải store**: gọi HTTP, hàm tiện ích, cấu hình.

## File dự kiến
| File | Vai trò | Người làm · Task |
|---|---|---|
| `api-client.ts` ✅ | Bọc `fetch`: base URL từ `NEXT_PUBLIC_API_URL`, gắn `Authorization: Bearer <token>`, parse JSON, ném `ApiError`, hiện toast; 401 → xóa token + phát `UNAUTHORIZED_EVENT` | C · W3-C3 |
| `utils.ts` ✅ | Re-export `cn()` từ gói `cn` (gộp className, thay cho clsx + tailwind-merge; component shadcn style `radix-nova` import trực tiếp từ gói này nên **không xóa** dependency `cn`) | C · W1-C2 |
| `sample-data.ts` | Dữ liệu mẫu, **chỉ dùng cho `/dev/ui` và test** (app lấy dữ liệu thật qua API từ W4-C1) | C · W2-C1 |
| `format.ts` ✅ | `formatShortDate` ("2 thg 11", cố định múi giờ Việt Nam để tránh lỗi hydration) | C · W2-C2 |
| `rank.ts` ✅ | `rankBetween(before, after)` (lexorank), `compareRank` | C · W2-C1 |
| `token.ts` ✅ | `getToken` / `setToken` / `clearToken` (localStorage, an toàn khi chạy trên server) | C · W3-C3 |

## Cách dùng `api-client`
```ts
import { api, ApiError } from '@/lib/api-client';
import type { AuthResponse, Issue } from '@evolve/shared';

const issues = await api.get<Issue[]>('/issues', { query: { projectId, status: 'TODO' } });
const created = await api.post<Issue>('/issues', { title: 'Việc mới', projectId });
await api.delete(`/issues/${id}`);

// Form tự hiển thị lỗi theo từng trường → tắt toast:
try {
  await api.post<AuthResponse>('/auth/login', values, { toastOnError: false });
} catch (e) {
  if (e instanceof ApiError && e.status === 401) setError('password', { message: e.message });
}
```

## Lỗi từ API
`ApiError` có `status` (0 = không kết nối được), `message` (từ API, tiếng Việt), `errors` (lỗi theo từng trường khi 400). Mặc định mọi lỗi đều hiện toast; truyền `toastOnError: false` nếu tự xử lý.

## Quy ước
- Hàm trong `lib/` không dùng React hook.
- Ghép className luôn dùng `cn(...)` để class Tailwind sau ghi đè đúng class trước.
