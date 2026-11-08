# apps/web/lib: Tiện ích

> Người phụ trách: **C**

## Mục đích
Chứa **code không phải component và không phải store**: gọi HTTP, hàm tiện ích, cấu hình.

## File dự kiến
| File | Vai trò | Người làm · Task |
|---|---|---|
| `api-client.ts` | Bọc `fetch`: base URL từ `NEXT_PUBLIC_API_URL`, gắn header `Authorization: Bearer <token>`, parse JSON, ném lỗi chuẩn, hiện toast | C · W3-C3 |
| `utils.ts` ✅ | `cn()` gộp className (shadcn sinh ở W1-C2); thêm hàm format ngày khi cần | C · W1-C2 |
| `sample-data.ts` ✅ | Dữ liệu mẫu (khớp seed của API, project EVO). Xóa sau W4-C1 | C · W2-C1 |
| `rank.ts` ✅ | `rankBetween(before, after)` (lexorank), `compareRank` | C · W2-C1 |
| `token.ts` | Đọc/ghi/xóa token | A · W3-A2 |

## Cách dùng `api-client`
```ts
// TODO(C, W3-C3): ví dụ api.get('/issues'), api.post('/issues', body)
```

## Quy ước
- Hàm trong `lib/` không dùng React hook.
- Ghép className luôn dùng `cn(...)` để class Tailwind sau ghi đè đúng class trước.
