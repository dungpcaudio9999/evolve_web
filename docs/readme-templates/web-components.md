# apps/web/components: Component giao diện

> Copy vào `apps/web/components/README.md` · Người điền: **C**

## Mục đích
Chứa toàn bộ **component React**, chia theo vai trò. Component chỉ lo hiển thị và nhận sự kiện; dữ liệu lấy từ store.

## Cấu trúc và file dự kiến

### `ui/`: component cơ bản (shadcn/ui) · C · W1-C2
Sinh bằng `pnpm dlx shadcn add <tên>`. **Hạn chế sửa trực tiếp**; nếu sửa thì ghi chú lại ở đây.
`button` · `input` · `textarea` · `dialog` · `dropdown-menu` · `popover` · `context-menu` · `command` · `avatar` · `badge` · `tooltip` · `separator`
<!-- TODO(C): ghi lại component đã sửa so với bản gốc -->

### `layout/`: khung trang · A
| File | Vai trò | Task |
|---|---|---|
| `sidebar.tsx` | Logo, link Issues/Projects, menu người dùng | W2-A4 |
| `header.tsx` | Tiêu đề trang, nút hành động | W2-A4 |
| `user-menu.tsx` | Avatar, đăng xuất | W3-A2 |

### `common/`: component nhỏ dùng nhiều nơi · C
| File | Vai trò | Task |
|---|---|---|
| `status-icon.tsx` | Icon theo trạng thái | W1-C3 |
| `priority-icon.tsx` | Icon theo độ ưu tiên | W1-C3 |
| `user-avatar.tsx` | Avatar người dùng | W1-C3 |
| `empty-state.tsx` | Hiển thị khi không có dữ liệu | W6-C1 |

### `issues/`: tính năng issue · C (riêng `filter-bar` do A làm)
| File | Vai trò | Task |
|---|---|---|
| `issue-line.tsx` | Một dòng issue trong list | W2-C2 |
| `issue-list.tsx` | List nhóm theo trạng thái | W2-C3 |
| `status-selector.tsx` | Chọn trạng thái | W3-C1 |
| `priority-selector.tsx` | Chọn độ ưu tiên | W3-C1 |
| `assignee-selector.tsx` | Chọn người được giao | W3-C1 |
| `label-selector.tsx`, `label-badge.tsx` | Chọn và hiển thị nhãn | W4-C2 |
| `create-issue-modal.tsx` | Modal tạo/sửa issue | W3-C2 |
| `issue-context-menu.tsx` | Menu chuột phải | W4-C2 |
| `issue-detail.tsx` | Nội dung trang chi tiết | W4-C3 |
| `issue-board.tsx`, `board-column.tsx`, `board-card.tsx` | Board kéo thả | W5-C1 |
| `view-switcher.tsx` | Chuyển list/board | W5-C1 |
| `search-command.tsx` | Tìm kiếm Ctrl+K | W5-C3 |
| `filter-bar.tsx` | Thanh lọc (A) | W5-A3 |

### `projects/`: tính năng project · A
| File | Vai trò | Task |
|---|---|---|
| `project-line.tsx` | Một dòng project | W4-A1 |
| `project-list.tsx` | Danh sách project | W4-A1 |
| `create-project-modal.tsx` | Tạo/sửa project | W4-A1 |

## Quy ước
- Tên file `kebab-case.tsx`, tên component `PascalCase`.
- Component **không gọi API trực tiếp**; dùng hàm của store.
- Màu sắc dùng biến theme (`bg-primary`, `text-muted-foreground`…), không ghi mã màu cứng.
<!-- TODO(C): bổ sung -->
