# apps/web/components: Component giao diện

> Người phụ trách: **C**

## Mục đích
Chứa toàn bộ **component React**, chia theo vai trò. Component chỉ lo hiển thị và nhận sự kiện; dữ liệu lấy từ store.

## Cấu trúc và file dự kiến

### `ui/`: component cơ bản (shadcn/ui) · C · W1-C2
Cấu hình trong `apps/web/components.json`: style `radix-nova` (Radix UI), màu nền `neutral`, icon `lucide`. Thêm component mới: `cd apps/web && pnpm dlx shadcn@latest add <tên>`. **Hạn chế sửa trực tiếp**; nếu sửa thì ghi chú lại ở đây.
`button` · `input` · `textarea` · `dialog` · `dropdown-menu` · `popover` · `context-menu` · `command` · `avatar` · `badge` · `tooltip` · `separator`
Thêm ở W3-A1: `label`, `card`; W4-C2: `alert-dialog`. Ngoài ra có `input-group` (do `command` cần) và `sonner.tsx` (toast, viết lại cố định theme tối, không dùng `next-themes`; `<Toaster />` đã đặt trong `app/layout.tsx`). Xem thử tất cả tại trang `/dev/ui`.

Component đã sửa so với bản gốc: _chưa có_.

### `auth/`: đăng nhập, đăng ký · A
| File | Vai trò | Task |
|---|---|---|
| `form-field.tsx` ✅ | Nhãn + ô nhập + dòng lỗi (liên kết `aria-describedby`) | W3-A1 |
| `auth-guard.tsx` ✅ | `AuthGuard` (bọc `(main)`: chưa đăng nhập → `/login?next=…`, nghe 401 để đăng xuất), `GuestGuard` (bọc `(auth)`: đã đăng nhập → vào app) | W3-A2 |
| `apply-api-error.ts` ✅ | Đưa lỗi API lên form: lỗi từng trường (400) và 401/409 vào đúng ô, còn lại toast | W3-A2 |

### `layout/`: khung trang · A
| File | Vai trò | Task |
|---|---|---|
| `sidebar.tsx` ✅ | Logo, link Issues/Projects, menu người dùng ở cuối (màn hình ≥ md) | W2-A4, W3-A2 |
| `header.tsx` ✅ | `<Header title actions />`: tiêu đề trang (tiếng Anh), nút hành động, thanh mobile | W2-A4 |
| `mobile-nav.tsx` ✅ | Thanh icon điều hướng cho màn hình < md | W2-A4 |
| `nav-items.ts` ✅ | Danh sách mục điều hướng (`NAV_ITEMS`), hàm `isActive` | W2-A4 |
| `logo.tsx` ✅ | Chữ "Evolve" (Panchang + gradient) | W2-A4 |
| `user-menu.tsx` ✅ | Avatar + tên, email, "Đăng xuất" (cuối sidebar; header trên mobile) | W3-A2 |

### `common/`: component nhỏ dùng nhiều nơi · C
| File | Vai trò | Task |
|---|---|---|
| `status-icon.tsx` ✅ | Icon theo trạng thái, màu từ `STATUS_BY_ID` | W1-C3 |
| `priority-icon.tsx` ✅ | Icon theo độ ưu tiên (`currentColor`; Urgent màu destructive) | W1-C3 |
| `user-avatar.tsx` ✅ | Avatar: ảnh, chữ cái đầu (`getInitials`), hoặc vòng nét đứt khi chưa giao | W1-C3 |
| `empty-state.tsx` | Hiển thị khi không có dữ liệu | W6-C1 |

### `issues/`: tính năng issue · C (riêng `filter-bar` do A làm)
| File | Vai trò | Task |
|---|---|---|
| `issue-line.tsx` ✅ | Tiêu đề là link tới `/issues/[id]`. Nhận thêm thuộc tính của `div` (ref, onContextMenu…) để bọc bằng `ContextMenuTrigger asChild`. Có `onChange` thì icon priority/status/avatar thành selector. Một dòng issue: priority, mã, status, tiêu đề, labels (≥ lg), ngày (≥ sm), avatar. Nhận `assignee` từ component cha | W2-C2 |
| `issue-list.tsx` ✅ | List nhóm theo trạng thái (ẩn nhóm rỗng), header có số lượng, bấm để thu gọn; prop `projectId` để lọc theo project | W2-C3 |
| `selector-popover.tsx` ✅ | Popover + Command dùng chung: tìm kiếm, bàn phím, dấu tích lựa chọn hiện tại | W3-C1 |
| `status-selector.tsx` ✅ | Chọn trạng thái (`showLabel` để hiện kèm tên, dùng trong modal) | W3-C1 |
| `priority-selector.tsx` ✅ | Chọn độ ưu tiên | W3-C1 |
| `assignee-selector.tsx` ✅ | Chọn người được giao, có lựa chọn "Chưa giao" (`null`) | W3-C1 |
| `label-badge.tsx` ✅ | Nhãn dạng viên thuốc có chấm màu | W2-C2 |
| `label-selector.tsx` ✅ | Chọn **nhiều** nhãn (bật/tắt, popover vẫn mở), dùng trong modal và trang chi tiết | W4-C2 |
| `create-issue-modal.tsx` ✅ | Modal tạo issue (gắn trong layout `(main)`), phím C, Ctrl+Enter để gửi | W3-C2 |
| `new-issue-button.tsx` ✅ | Nút "New issue" trong Header | W3-C2 |
| `project-selector.tsx` ✅ | Chọn project trong modal | W3-C2 |
| `issue-context-menu.tsx` ✅ | Menu chuột phải: mở issue, đổi trạng thái / độ ưu tiên (menu con), xóa | W4-C2 |
| `delete-issue-dialog.tsx` ✅ | Hộp thoại xác nhận xóa issue (AlertDialog) | W4-C2 |
| `issue-detail.tsx` ✅ | Nội dung trang chi tiết: tiêu đề, mô tả (lưu khi rời ô), panel thuộc tính, xóa | W4-C3 |
| `editable-title.tsx` ✅ | Tiêu đề sửa tại chỗ: Enter/rời ô lưu, Esc hủy, bỏ trống giữ tiêu đề cũ | W4-C3 |
| `issue-board.tsx`, `board-column.tsx`, `board-card.tsx` | Board kéo thả | W5-C1 |
| `view-switcher.tsx` | Chuyển list/board | W5-C1 |
| `search-command.tsx` | Tìm kiếm Ctrl+K | W5-C3 |
| `filter-bar.tsx` | Thanh lọc (A) | W5-A3 |

### `projects/`: tính năng project · A
| File | Vai trò | Task |
|---|---|---|
| `project-line.tsx` ✅ | Một dòng project (icon, tên, key, ngày), bấm mở chi tiết | W4-A1 |
| `project-list.tsx` ✅ | Danh sách, tự tải; trạng thái đang tải / lỗi / rỗng | W4-A1 |
| `project-form-modal.tsx` ✅ | Tạo hoặc sửa project (khi sửa khóa key); key trùng báo tại ô | W4-A1 |
| `project-detail.tsx` ✅ | Trang chi tiết project: tên, key, số issue, sửa, xóa (cảnh báo xóa cả issue), danh sách issue của project | W4-A2 |
| `project-icon.tsx` ✅ | Ô vuông màu project với emoji hoặc chữ cái của key | W4-A1 |
| `project-colors.ts` ✅ | Bảng màu chọn cho project (theo taalas) | W4-A1 |

## Quy ước
- Tên file `kebab-case.tsx`, tên component `PascalCase`.
- Component **không gọi API trực tiếp**; dùng hàm của store.
- Màu sắc dùng biến theme (`bg-primary`, `text-muted-foreground`…), không ghi mã màu cứng.
- `TooltipProvider` đã bọc toàn app trong `app/layout.tsx`; dùng `Tooltip` ở đâu cũng được.
- Component có state hoặc sự kiện thì thêm `'use client'` ở đầu file.
- Icon/avatar nằm cạnh chữ cùng nghĩa thì truyền `decorative` để trình đọc màn hình không đọc lặp.
- Test component: file `*.test.tsx` có dòng đầu `// @vitest-environment jsdom`, dùng `@testing-library/react` + `user-event` (xem `issues/selectors.test.tsx`).
- Tiêu đề **tiếng Việt** thêm `font-sans` (vd. `<CardTitle className="font-sans">`): `CardTitle` mặc định dùng `font-heading` (Panchang) không có chữ Việt có dấu.
