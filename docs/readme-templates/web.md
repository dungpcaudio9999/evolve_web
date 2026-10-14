# apps/web: Frontend

> Copy vào `apps/web/README.md` sau W1-C1 · Người điền: **C** · Phát triển: **A**, **C**

## Mục đích
Ứng dụng giao diện người dùng: hiển thị và thao tác với issue, project; đăng nhập; gọi REST API của `apps/api`.

## Tech stack
| Hạng mục | Công cụ |
|---|---|
| Framework | Next.js 15 (App Router), React 19, TypeScript |
| Giao diện | Tailwind CSS v4, shadcn/ui, lucide-react |
| State | Zustand, nuqs (URL state) |
| Form | react-hook-form + zod |
| Khác | react-dnd, lexorank, cmdk, sonner, date-fns |

## Cấu trúc
| Thư mục | Vai trò | README |
|---|---|---|
| `app/` | Routing: mỗi thư mục là một trang | [app/README.md](app/README.md) |
| `components/` | Component giao diện | [components/README.md](components/README.md) |
| `store/` | Zustand store, nơi duy nhất gọi API | [store/README.md](store/README.md) |
| `hooks/` | Hook dùng chung (`use-hotkey`, `use-mobile`…) | – |
| `lib/` | `api-client`, hàm tiện ích | [lib/README.md](lib/README.md) |
| `public/` | Ảnh, logo, favicon, font Panchang | – |

## Biến môi trường
| Biến | Ví dụ | Ý nghĩa |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000` | Địa chỉ API |
<!-- TODO(C): bổ sung nếu có -->

## Lệnh
```bash
pnpm --filter web dev        # chạy ở http://localhost:3000
pnpm --filter web build
pnpm --filter web lint
```
<!-- TODO(C): xác nhận lại sau khi khởi tạo -->

## Luồng dữ liệu
```text
Component ──gọi hàm──► Store (Zustand) ──► lib/api-client ──HTTP──► apps/api
```
<!-- TODO(C): giải thích ngắn -->

## Liên quan
- Phân vai: [docs/ROLES.md](../../docs/ROLES.md) · Task: W1-C1…W6-C2 trong [docs/TIMELINE.md](../../docs/TIMELINE.md)
