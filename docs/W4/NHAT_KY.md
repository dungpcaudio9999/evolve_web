# Tuần 4: Nhật ký thực hiện

> Người ghi: A (nhóm trưởng) · Ngày thực hiện: 10/11/2026 (giờ Việt Nam)
> Liên quan: [Báo cáo tuần 4](README.md) · [Hướng dẫn](HUONG_DAN.md)

Ghi lại **quá trình** làm tuần 4: thứ tự, vấn đề gặp phải và cách xử lý. Kết quả cuối xem [báo cáo](README.md).

---

## 1. Chuẩn bị

### 1.1 Bối cảnh
- Tuần 3 đã xong, `main` đã release **v0.3**, `dev` = `0a081b7`.
- Đối chiếu lịch: hôm nay là cuối tuần 4 theo kế hoạch → cần đạt M4 để không trễ thêm.
- Repo vẫn chỉ có tài khoản A.

### 1.2 Quyết định trước khi làm
| Câu hỏi | Chọn |
|---|---|
| Làm thế nào | A làm toàn bộ code tuần 4 (cả phần B, C) như tuần 2–3 |
| Merge | Mỗi task 1 PR từ `dev`, CI xanh thì squash merge bằng quyền admin (nhóm trưởng cho phép riêng cho tuần 4) |
| Điều chỉnh TIMELINE | W4-B3 (test auth) đã có từ tuần 3 → thay bằng e2e issues và e2e cô lập dữ liệu |

### 1.3 Thứ tự
```text
B2 users/labels → B1 issues API → A1 projects → C1 store gọi API → C2 menu + nhãn
→ C3 chi tiết issue → A2 chi tiết project → A3 cô lập dữ liệu → tài liệu
```
Backend trước để frontend nối thẳng vào API thật, không phải làm dữ liệu giả.

### 1.4 Sự cố mạng đầu buổi
`git fetch` bị treo quá 2 phút (SSH tới GitHub). Dừng lệnh, đọc code ở máy; thử lại sau thì kết nối bình thường. Không phải lỗi của repo.

### 1.5 Công cụ kiểm tra trình duyệt
Tách script tuần 3 thành:
- `cdp.mjs`: hàm dùng chung (bấm, gõ, chuột phải, chờ, chụp ảnh, đăng nhập) qua DevTools Protocol.
- `run.sh`: build → seed lại DB → chạy API + web + Chrome → chạy kịch bản → tắt hết.

Mỗi kịch bản chạy trên **dữ liệu seed sạch** nên kết quả lặp lại được.

---

## 2. Diễn biến theo task

### 18:49 · W4-B2: users, labels (PR #81)
**Làm:** `GET /users` (qua `toUser()`, không lộ mật khẩu), `GET /labels`, cần JWT; 3 e2e.
**Vấn đề:** lint báo module "không dùng": thay chuỗi để thêm vào `imports` của `AppModule` không khớp vì Prettier đã xuống dòng mảng → sửa bằng `sed` theo từng dòng.

### 18:54 · W4-B1: Module issues (PR #82)
**Làm:** CRUD, lọc (`q` tìm cả tiêu đề và mã, không phân biệt hoa thường), sinh `KEY-số` bằng `Project.issueCounter` **trong transaction**, rank cuối cột (lexorank), đổi trạng thái → cuối cột mới, `labelIds` thay toàn bộ nhãn, bỏ qua `projectId` khi sửa.
**Kiểm tra:** 9 e2e đạt ngay lần đầu. Thêm 1 test **5 issue tạo đồng thời** → mã không trùng, liên tiếp. Kiểm tra seed: An 15 issue EVO, Bình 15 issue MOB, Bình đọc issue của An → 404.

### 19:00 · W4-A1: projects (PR #83)
**Làm:** `projects-store`, `/projects`, modal tạo/sửa (khóa key khi sửa, màu theo bảng taalas).
**Vấn đề 1:** form dùng hai schema khác nhau (tạo có key, sửa không) → kiểu của resolver không khớp. Lần đầu ép kiểu `as never` (quá rộng); đổi sang `as unknown as Resolver<FormInput>`. Lần sửa đầu không ăn vì Prettier đã định dạng lại → sửa bằng biểu thức chính quy.
**Vấn đề 2 (ảnh chụp):** khi ô Key có dòng lỗi, nhãn "Icon" bị lệch xuống (ô bên cạnh bị kéo giãn theo chiều cao) → `items-start`; script đo lại: lệch 0px.
**Kiểm tra:** 7/7 bước trình duyệt (key trùng báo tại ô, tạo → tải lại còn, Bình chỉ thấy MOB).
**Sự cố:** bước `git pull` cuối script quá thời gian chờ (mạng chậm); kiểm tra lại thì PR đã merge, `dev` đúng.

### 19:13 · W4-C1: issues-store gọi API (PR #84)
**Làm:** store gọi `/issues`, `/users`, `/labels`; thêm chờ API, sửa/xóa cập nhật ngay rồi hoàn tác nếu lỗi; `IssueList` tự tải, có trạng thái đang tải/lỗi/rỗng; modal lấy project từ `projects-store`.
**Vấn đề (đọc lại code):** modal gọi `reset()` mỗi khi danh sách project thay đổi → nếu project tải xong lúc người dùng đang gõ thì mất chữ. Sửa: chỉ điền ô project nếu còn trống.
**Kiểm tra:** store 11 test (gồm hoàn tác khi lỗi); 7/7 bước trình duyệt (đổi trạng thái và tạo issue → **tải lại vẫn còn**).

### 19:21 · W4-C2: Menu chuột phải, chọn nhãn (PR #85)
**Làm:** `issue-context-menu` (menu con trạng thái/độ ưu tiên, xóa), `delete-issue-dialog` (AlertDialog), `label-selector` (chọn nhiều).
**Vấn đề 1:** thêm `alert-dialog` thì shadcn hỏi ghi đè `button.tsx` → trả lời **không**, giữ bản đang dùng.
**Vấn đề 2:** `ContextMenuTrigger asChild` cần chuyển `ref` và sự kiện chuột phải xuống thẻ `div` của `IssueLine`, mà `IssueLine` không nhận thuộc tính thừa → menu sẽ không mở. Sửa: `IssueLine` nhận và chuyển tiếp thuộc tính của `div`.
**Vấn đề 3 (script, không phải app):** kịch bản báo không thấy nhãn "Bug". Điều tra: popover vẫn mở bình thường; lỗi do script bấm khi **hiệu ứng mở modal chưa xong** (vị trí nút đang thay đổi). Lần sau lại báo thiếu nhãn sau khi tạo issue → thêm bước kiểm tra trung gian, xác nhận **Esc chỉ đóng popover**, app đúng; lần trước do thời gian. Thêm chờ sau khi mở hộp thoại.
**Kiểm tra:** 9/9 bước trình duyệt.

### 19:27 · W4-C3: Chi tiết issue (PR #86)
**Làm:** `/issues/[id]`, `editable-title` (Enter/rời ô lưu, Esc hủy, bỏ trống giữ cũ), mô tả lưu khi rời ô, panel thuộc tính, xóa; tiêu đề trong danh sách thành link.
**Lo ngại:** Esc hủy dựa vào thứ tự cập nhật state rồi mới rời ô → viết test riêng xác nhận không lưu bản nháp (đạt).
**Vấn đề (ảnh chụp):** "Lê Minh Chi" xuống dòng trong nút người làm → `whitespace-nowrap` + cắt "…"; đo lại: 1 dòng. Ô mô tả thấp → `min-h-48`.
**Kiểm tra:** 5/5 bước (tải lại vẫn giữ tiêu đề/mô tả/độ ưu tiên; Bình mở link issue của An → "Không tìm thấy").

### 22:24 · W4-A2: Chi tiết project (PR #87)
**Làm:** `/projects/[id]`, sửa (dùng lại modal), xóa có cảnh báo số issue, danh sách issue của project; **New issue chọn sẵn project** (`ui-store.createIssueProjectId`); header hiện key vì font tiêu đề không có chữ Việt.
**Vấn đề (script):** không tìm thấy nút "Lưu". Kiểm tra: modal vẫn đúng; script gọi `select()` mà chưa đặt con trỏ vào ô nên chữ gõ rơi ra ngoài. Sửa script; thêm cơ chế **luôn in kết quả kể cả khi script dừng giữa chừng**.
**Kiểm tra:** 8/8 bước.

### 22:31 · W4-A3: Cô lập dữ liệu (PR #88)
**Làm:** đăng nhập/đăng xuất gọi `reset()` của store issue và project; e2e API 2 người dùng (cùng key `ISO`, danh sách riêng, mọi thao tác chéo → 404, dữ liệu người kia nguyên vẹn).
**Vấn đề (phát hiện trên trình duyệt):** kịch bản mong Bình vào `/issues` nhưng Bình vào `/projects`. Nguyên nhân: An **tự đăng xuất** ở `/projects` → `AuthGuard` vẫn gắn `?next=/projects` → người sau bị đưa vào trang người trước dùng dở. Sửa: lưu `logoutReason`; tự đăng xuất → `/login`, phiên hết hạn → giữ `?next`.
**Kiểm tra:** 7/7 bước, trong đó **lấy mẫu nội dung trang liên tục 3 giây** sau khi Bình đăng nhập: không lúc nào có chữ của An. Chạy lại 9 bước đăng nhập tuần 3: vẫn đạt.

### Kiểm tra cuối trên `dev`
Chạy lại toàn bộ 7 kịch bản trên `9153543`: **52/52**. CI trên `dev` xanh.

---

## 3. Số liệu

| Chỉ số | Giá trị |
|---|---|
| PR | 8 (#81–#88), 0 conflict, 0 force-push, CI xanh trước khi merge |
| Test tự động | 121 (tuần 3: 74) |
| Kiểm tra trình duyệt | 52/52 bước, 7 kịch bản |
| Lỗi app tìm thấy và sửa | 6 (2 qua ảnh chụp, 2 qua đọc lại code, 1 qua phân tích luồng, 1 qua chạy trình duyệt) |
| Báo lỗi giả của script | 3, đều xác minh app đúng trước khi sửa script |
| Thay đổi | 60 file, +2743 / −212 dòng |

## 4. Rút kinh nghiệm

1. **Làm backend trước** giúp frontend nối thẳng API thật, không phải viết rồi bỏ dữ liệu giả.
2. **Kiểm tra "tải lại trang"** là cách chắc nhất để biết dữ liệu thật sự vào DB; test đơn vị với API giả không chứng minh được điều này.
3. **Script kiểm tra trình duyệt cũng có lỗi**: khi script báo đỏ, phải xác minh app trước (in trạng thái, chụp ảnh) rồi mới kết luận. 3 lần báo đỏ là lỗi script; 1 lần (W4-A3) là lỗi thật của app.
4. **Hiệu ứng mở modal** làm vị trí nút thay đổi trong ~200ms → script phải chờ sau khi mở.
5. **Luồng đăng nhập/đăng xuất giữa 2 người** dễ lộ dữ liệu hoặc đưa người sau vào trang của người trước; cần kịch bản kiểm tra riêng với nhiều tài khoản.
6. **Ảnh chụp màn hình** tiếp tục bắt được lỗi bố cục mà test không thấy (lệch nhãn, xuống dòng).
7. Rủi ro lớn nhất vẫn là **làm việc nhóm**: B, C chưa vào repo, chưa review, chưa họp.
