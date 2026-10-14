# apps/web/app: Routing

> Copy vào `apps/web/app/README.md` · Người điền: **A**

## Mục đích
Định nghĩa **các trang và layout** theo App Router của Next.js: mỗi thư mục là một đoạn URL, `page.tsx` là nội dung trang, `layout.tsx` là phần khung bao quanh.

## Nhóm route
| Nhóm | Layout | Cần đăng nhập | Ghi chú |
|---|---|---|---|
| `(auth)` | Căn giữa, không có sidebar | Không | Đã đăng nhập thì chuyển sang `/issues` |
| `(main)` | Có sidebar và header | Có | Chưa đăng nhập thì chuyển về `/login` |

Tên trong ngoặc `( )` chỉ dùng để nhóm, **không** xuất hiện trên URL.

## File dự kiến
| File | URL | Vai trò | Người làm · Task |
|---|---|---|---|
| `layout.tsx` | – | Layout gốc: font, theme, `<Toaster />` | A · W2-A3 |
| `globals.css` | – | Design system taalas (màu, bo góc, `text-gradient`) | A · W2-A2 |
| `page.tsx` | `/` | Chuyển hướng sang `/issues` | C · W2-C2 |
| `not-found.tsx` | – | Trang 404 | A |
| `(auth)/layout.tsx` | – | Layout cho trang đăng nhập/đăng ký | A · W3-A1 |
| `(auth)/login/page.tsx` | `/login` | Đăng nhập | A · W3-A1 |
| `(auth)/register/page.tsx` | `/register` | Đăng ký | A · W3-A1 |
| `(main)/layout.tsx` | – | Sidebar + header + route guard | A · W2-A4, W3-A2 |
| `(main)/issues/page.tsx` | `/issues` | List/board issue, filter bar | C · W2-C3, W5-C1 |
| `(main)/issues/[id]/page.tsx` | `/issues/:id` | Chi tiết issue | C · W4-C3 |
| `(main)/projects/page.tsx` | `/projects` | Danh sách project | A · W4-A2 |
| `(main)/projects/[id]/page.tsx` | `/projects/:id` | Issue của một project | A · W4-A2 |

## Quy ước
- `page.tsx` chỉ ghép component; logic đặt trong `components/` và `store/`.
- Component có tương tác (state, sự kiện) thì thêm `'use client'`.
<!-- TODO(A): bổ sung -->
