# apps/web/app: Routing

> Người phụ trách: **A**

## Mục đích
Định nghĩa **các trang và layout** theo App Router của Next.js: mỗi thư mục là một đoạn URL, `page.tsx` là nội dung trang, `layout.tsx` là phần khung bao quanh.

## Nhóm route
| Nhóm | Layout | Cần đăng nhập | Ghi chú |
|---|---|---|---|
| `(auth)` | Căn giữa, không có sidebar | Không | Đã đăng nhập thì chuyển sang `/issues` |
| `(main)` | Có sidebar và header | Có | Chưa đăng nhập thì chuyển về `/login?next=…` (kiểm tra ở trình duyệt vì token nằm trong localStorage; API vẫn tự kiểm tra JWT) |

Tên trong ngoặc `( )` chỉ dùng để nhóm, **không** xuất hiện trên URL.

## File dự kiến
| File | URL | Vai trò | Người làm · Task |
|---|---|---|---|
| `layout.tsx` | – | Layout gốc: font, theme, `<TooltipProvider>` (đã có), `<Toaster />` | A · W2-A3 |
| `icon.svg` ✅ | – | Favicon: chữ "E" gradient taalas trên nền navy (Next.js tự sinh `<link rel="icon">`) | A · W3-A3 |
| `globals.css` | – | Design system taalas (màu, bo góc, `text-gradient`) | A · W2-A2 |
| `page.tsx` ✅ | `/` | Chuyển hướng sang `/issues` | C · W2-C3 |
| `not-found.tsx` | – | Trang 404 | A |
| `dev/ui/page.tsx` ✅ | `/dev/ui` | Xem thử component UI và common | C · W1-C2, W1-C3 |
| `(auth)/layout.tsx` ✅ | – | Căn giữa, logo, không có sidebar | A · W3-A1 |
| `(auth)/login/page.tsx` ✅ | `/login` | Đăng nhập → `/auth/login`; thành công thì về `?next` (chỉ đường dẫn nội bộ) | A · W3-A1, W3-A2 |
| `(auth)/register/page.tsx` ✅ | `/register` | Đăng ký → `/auth/register`; email trùng báo lỗi tại ô email | A · W3-A1, W3-A2 |
| `(main)/layout.tsx` ✅ | – | `AuthGuard` + sidebar + vùng nội dung + modal tạo issue; mỗi trang tự render `<Header>` | A · W2-A4, W3-A2 |
| `(main)/issues/page.tsx` ✅ | `/issues` | Danh sách issue (W2-C3); board, filter bar thêm ở W5 | C · W2-C3, W5-C1 |
| `(main)/issues/[id]/page.tsx` ✅ | `/issues/:id` | Chi tiết issue (header hiện mã EVO-12); issue của người khác → "Không tìm thấy" | C · W4-C3 |
| `(main)/projects/page.tsx` ✅ | `/projects` | Danh sách project + nút "New project" | A · W4-A1 |
| `(main)/projects/[id]/page.tsx` | `/projects/:id` | Issue của một project | A · W4-A2 |

## Quy ước
- `page.tsx` chỉ ghép component; logic đặt trong `components/` và `store/`.
- Component có tương tác (state, sự kiện) thì thêm `'use client'`.
- Trang `/dev/*` chỉ dùng để xem thử component trong lúc phát triển (W1-C2, W1-C3).
