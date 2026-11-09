# apps/web: Frontend

> Người phụ trách: **C** · Phát triển: **A**, **C** · Khởi tạo ở W1-C1 (Next.js 15.5, React 19.1, Tailwind v4)

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
Tạo file từ mẫu: `cp apps/web/.env.example apps/web/.env.local`. Biến `NEXT_PUBLIC_*` được đưa vào code chạy trên trình duyệt, **không** đặt bí mật ở đây.

## Lệnh
```bash
pnpm --filter @evolve/shared build   # cần build contract trước (pnpm dev ở gốc đã tự làm)
pnpm --filter web dev        # chạy ở http://localhost:3000 (Turbopack)
pnpm --filter web build
pnpm --filter web start      # chạy bản build
pnpm --filter web lint
pnpm --filter web typecheck  # sinh type cho route (next typegen) rồi chạy tsc
pnpm --filter web test       # Vitest: logic (Node) + component (jsdom, Testing Library)
```

## Luồng dữ liệu
```text
Component ──gọi hàm──► Store (Zustand) ──► lib/api-client ──HTTP──► apps/api
```
- Component chỉ đọc state và gọi hàm của store; **không** gọi `fetch` trực tiếp.
- Store (Zustand) gọi `lib/api-client.ts`, client này gắn token và xử lý lỗi.
- Kiểu dữ liệu, hằng số (`STATUSES`, `PRIORITIES`) và zod schema lấy từ `@evolve/shared`.

## Liên quan
- Phân vai: [docs/ROLES.md](../../docs/ROLES.md) · Task: W1-C1…W6-C2 trong [docs/TIMELINE.md](../../docs/TIMELINE.md)
