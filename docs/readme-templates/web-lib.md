# apps/web/lib: Tiện ích

> Copy vào `apps/web/lib/README.md` · Người điền: **C**

## Mục đích
Chứa **code không phải component và không phải store**: gọi HTTP, hàm tiện ích, cấu hình.

## File dự kiến
| File | Vai trò | Người làm · Task |
|---|---|---|
| `api-client.ts` | Bọc `fetch`: base URL từ `NEXT_PUBLIC_API_URL`, gắn header `Authorization: Bearer <token>`, parse JSON, ném lỗi chuẩn, hiện toast | C · W3-C3 |
| `utils.ts` | `cn()` (gộp className, do shadcn sinh), format ngày | C · W1-C2 |
| `sample-data.ts` | Dữ liệu mẫu dùng trước khi có API (xóa sau W4) | C · W2-C1 |
| `token.ts` | Đọc/ghi/xóa token | A · W3-A2 |

## Cách dùng `api-client`
```ts
// TODO(C): ví dụ api.get('/issues'), api.post('/issues', body)
```

## Quy ước
- Hàm trong `lib/` không dùng React hook.
<!-- TODO(C): bổ sung -->
