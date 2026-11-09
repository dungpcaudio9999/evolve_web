# Tuần 3: Nhật ký thực hiện

> Người ghi: A (nhóm trưởng) · Ngày thực hiện: 09/11/2026 (giờ Việt Nam)
> Liên quan: [Báo cáo tuần 3](README.md) · [Hướng dẫn](HUONG_DAN.md)

Ghi lại **quá trình** làm tuần 3: đã làm gì, theo thứ tự nào, gặp vấn đề gì và xử lý ra sao. Kết quả cuối cùng xem ở [báo cáo](README.md).

---

## 1. Chuẩn bị

### 1.1 Bối cảnh
- Tuần 2 đã merge xong vào `dev` (commit `60e0e15`), CI xanh.
- Repo vẫn chỉ có tài khoản của A; toàn bộ task của B và C tuần 3 do A làm thay.
- Rút kinh nghiệm tuần 2: chuỗi 12 PR xếp chồng + squash merge gây conflict liên tiếp, phải rebase và force-push nhiều lần.

### 1.2 Quyết định trước khi làm (nhóm trưởng chốt)

| Câu hỏi | Chọn | Lý do |
|---|---|---|
| Cách merge | Mỗi task 1 PR tách từ `dev` mới nhất; CI xanh thì squash merge ngay bằng quyền admin | Không xếp chồng → không conflict, không force-push. Đánh đổi: không có người review |
| Ai xem được project | Chỉ chủ project (đúng PLAN) | Seed đổi `MOB` sang Bình để demo có 2 tài khoản có dữ liệu |
| Lưu token | `localStorage` + header Bearer | Đơn giản, đúng PLAN; cookie httpOnly an toàn hơn nhưng phức tạp khi web và API khác domain |

### 1.3 Thứ tự làm (theo phụ thuộc)
`W3-A2` (route guard) cần cả `W3-B1` (API auth) và `W3-C3` (api-client), nên làm cuối. Thứ tự thực hiện:

```text
B3 Swagger → B1 Auth → C3 api-client → A1 Trang login → B2 Projects
→ C1 Selector → C2 Modal → A3 Favicon → A2 Auth flow → Báo cáo
```

### 1.4 Quy trình lặp lại cho mỗi task
1. Tạo issue `[W3-xx]` trên GitHub (#48–#57).
2. `git switch dev && git pull` → `git switch -c feature/W3-xx-…`.
3. Viết code + test.
4. Kiểm tra đầy đủ: `pnpm install --frozen-lockfile && pnpm build && pnpm typecheck && pnpm lint && pnpm test && pnpm format:check`.
5. Commit → push → tạo PR vào `dev` → **chờ CI GitHub xanh** → squash merge → đóng issue bằng tay (merge vào `dev` không tự đóng issue) → về `dev`.

Bước 4–5 được gói vào một script để không bỏ sót bước nào.

---

## 2. Diễn biến theo task

### 13:24 · W3-B3: Swagger và validation (PR #58)
**Làm:** cài `@nestjs/swagger`, `nestjs-zod`; Swagger tại `/docs`; `ZodValidationPipe` toàn cục; bộ lọc lỗi trả lỗi validate theo từng trường.

**Vấn đề 1:** `nestjs-zod` bản 5 cần zod 4, contract đang dùng zod 3.
→ Dùng `nestjs-zod` **4.3.1**, kiểm tra cả API chỉ còn một bản zod (3.25.76).

**Vấn đề 2:** test e2e lỗi `Cannot find module '@nestjs/swagger/dist/services/schema-object-factory'`.
→ Điều tra: `@nestjs/swagger` 11.4.8 có trường `exports` trong `package.json` chặn import sâu, mà `patchNestJsSwagger()` của `nestjs-zod` 4 cần import sâu. Dò từng phiên bản bằng `npm view @nestjs/swagger@<v> exports`: 11.4.2 chưa có, 11.4.3 bắt đầu có.
→ **Ghim `@nestjs/swagger` = 11.4.2** (exact), ghi lý do vào `apps/api/README.md`.

**Kiểm tra:** unit 5/5, e2e 4/4; chạy thật `/docs` 200, OpenAPI có bearer auth.

### 13:29 · W3-B1: Module auth (PR #59)
**Làm:** `register`, `login`, `me`; JWT (passport-jwt); `JwtAuthGuard`; `@CurrentUser()`; `toUser()` không trả `passwordHash`; sai email và sai mật khẩu cùng một thông báo.

**Vấn đề 1:** `@nestjs/jwt` bản mới nhất (12) báo `Must use import to load ES Module`.
→ Bản 12 chỉ có ESM và dành cho NestJS 12; API đang là NestJS 11 CommonJS. Hạ về **`@nestjs/jwt` 11, `@nestjs/passport` 11** (kiểm tra `type: commonjs`).

**Vấn đề 2:** kiểu `expiresIn` của `JwtModule` không nhận `string` thường → ép kiểu theo `JwtSignOptions['expiresIn']`.

**Vấn đề 3:** một unit test thất bại dù code đúng: tạo promise bị từ chối trước khi gắn `expect(...).rejects` → Jest coi là lỗi chưa xử lý. Sửa test để `await` ngay từng promise.

**Vấn đề 4:** e2e auth cần PostgreSQL. Dùng `dotenv` đọc `apps/api/.env` khi test; không có `DATABASE_URL` thì `describe.skip`. Phát hiện **CI chạy migrate sau test** → e2e trên CI không có bảng → đưa bước migrate lên trước test, thêm `JWT_SECRET` cho CI.

**Kiểm tra:** unit 8/8, e2e 10/10 (đã xác nhận 6 test auth chạy thật, không bị bỏ qua; dữ liệu test được dọn sạch); đăng nhập tài khoản seed bằng curl thành công; CI chạy e2e auth trên PostgreSQL của GitHub.

**Sự cố thao tác:** lệnh chạy script bị quá 120 giây nên bị chuyển chạy nền (cả ở PR #58). Từ PR sau đặt thời gian chờ dài hơn.

### 13:33 · W3-C3: api-client (PR #60)
**Làm:** `lib/api-client.ts` (gắn token, `ApiError`, toast, 401 → xóa token + phát sự kiện), `lib/token.ts`, `<Toaster />`.

**Quyết định:** component `sonner` của shadcn cần `next-themes`; app chỉ có nền tối nên tự viết lớp bọc cố định `theme="dark"`, không thêm thư viện.

**Kiểm tra:** 6 test (mock `fetch`): gắn header, lỗi có `errors`, tắt toast, 401 xóa token, mất kết nối, 204. Phát hiện và bỏ một dòng `afterEach` vô tác dụng trong test.

### 13:38 · W3-A1: Trang đăng nhập / đăng ký (PR #61)
**Làm:** `app/(auth)/layout.tsx`, `/login`, `/register` với react-hook-form + schema của contract; `FormField` có `aria-describedby`.

**Vấn đề 1:** web chưa có `zod` trong dependency → thêm đúng bản 3.25.76 như contract (zod 4 thấy trong cây phụ thuộc là của công cụ `shadcn`, không vào bundle).

**Vấn đề 2 (phát hiện qua ảnh chụp):** tiêu đề "Đăng nhập" hiện bằng font Panchang, chữ Việt bị lẫn font. Nguyên nhân: `CardTitle` của shadcn mặc định dùng `font-heading`. → Thêm `font-sans` cho tiêu đề tiếng Việt, ghi quy ước vào README.

### 13:41 · W3-B2: Module projects (PR #62)
**Làm:** CRUD `/projects`, chỉ chủ project; người khác → 404; key trùng → 409; không đổi được key; seed `MOB` → Bình.

**Vấn đề (phát hiện khi đọc lại test):** e2e auth dọn dẹp bằng cách xóa **mọi** user `@evolve.test`, còn e2e projects cũng tạo user cùng đuôi. Nếu Jest chạy hai file song song, test này có thể xóa user của test kia → test chập chờn.
→ Mỗi bộ chỉ xóa user của mình; e2e chạy `--runInBand`.

**Kiểm tra:** e2e 19/19; curl 3 tài khoản seed: An `['EVO']`, Bình `['MOB']`, Chi `[]`.

### 13:46 · W3-C1: Selector (PR #63)
**Làm:** `SelectorPopover` dùng chung (Popover + Command) và 3 selector; gắn vào dòng issue.

**Quyết định:** thêm **test component** (Testing Library + jsdom) vì tuần 2 phần tương tác chưa test được. Cần `vitest.setup.ts` bổ sung `ResizeObserver`, `scrollIntoView` cho Radix/cmdk.

**Vấn đề (test phát hiện):** tên lựa chọn ra "BacklogBacklog". Icon SVG có `<title>` riêng nằm cạnh chữ cùng nghĩa → **trình đọc màn hình đọc lặp**.
→ Thêm prop `decorative` cho `StatusIcon`, `PriorityIcon`, `UserAvatar` (ẩn khỏi trình đọc màn hình). Lần sửa đầu dùng thay chuỗi không khớp do Prettier đã xuống dòng → chuyển sang thay bằng biểu thức chính quy.

**Kiểm tra:** web 21/21.

### 13:51 · W3-C2: Modal tạo issue (PR #64)
**Làm:** `create-issue-modal` (gắn một lần trong layout), `ui-store`, `useHotkey('c')` (bỏ qua khi đang gõ, khi có Ctrl/Meta, khi đang có hộp thoại), `project-selector`, nút "New issue", Ctrl+Enter để gửi.

**Kiểm tra:** 6 test mới (phím tắt; modal: phím C mở, tiêu đề trống báo lỗi, tạo có đổi priority → có trong store + toast + đóng). Web 27/27.

### 13:54 · W3-A3: Favicon (PR #65)
**Làm:** `app/icon.svg` (chữ "E" gradient taalas), xóa `favicon.ico`.

**Thay đổi so với plan:** plan định xóa gói `cn` "nếu không dùng". Kiểm tra thấy 10 component shadcn `radix-nova` import trực tiếp `from 'cn'` → **giữ lại**, ghi chú README.

### 13:59 · W3-A2: Auth flow (PR #66)
**Làm:** `auth-store` (`init`, `login`, `register`, `logout`), `AuthGuard` / `GuestGuard`, `safeNextPath` chặn chuyển hướng ra ngoài, `applyApiError` đưa lỗi API vào đúng ô, `user-menu`.

**Vấn đề:** trang đăng ký trùng tên `register` (react-hook-form) với `register` (auth-store) → đổi thành `registerAccount`. `GuestGuard` ban đầu viết lặp logic kiểm tra đường dẫn → dùng lại `safeNextPath`.

**Kiểm tra:**
- Vitest: auth-store 7, guard 5, trang đăng nhập 3 → web 42/42.
- **Lần đầu kiểm tra trên trình duyệt thật**: viết script điều khiển Chrome headless qua DevTools Protocol (dùng `WebSocket` có sẵn trong Node 24, không cài thêm). Chạy API + web + PostgreSQL thật, 9/9 bước đạt (chuyển hướng khi chưa đăng nhập, sai mật khẩu, đăng nhập, tải lại, đăng xuất, token giả…).

### 14:03 · Báo cáo (PR #68)
Chạy lại kiểm tra trình duyệt trên `dev` sau khi merge: 9/9 bước auth + 4 bước (phím C tạo issue, toast, `/docs`) = **13/13**. Chụp ảnh, viết `docs/W3/README.md`. CI trên `dev` xanh (`c337314`).

---

## 3. Sau khi kết thúc tuần (khi nhóm trưởng chạy thử)

| Hiện tượng | Nguyên nhân | Xử lý |
|---|---|---|
| Web "fail to load page"; terminal chỉ có log API | Turbopack: **OS file watch limit reached**. Máy dùng 129 inotify instance, giới hạn 128 | Tăng `fs.inotify.max_user_instances`, `max_user_watches` (cần `sudo`); hoặc chạy web bằng `build && start`. Ghi vào [Hướng dẫn, Lỗi 1](HUONG_DAN.md#lỗi-1-web-không-mở-được-os-file-watch-limit-reached) |
| `bash: số-PR: No such file or directory` | Copy nguyên chỗ giữ chỗ `<số-PR>` trong lệnh mẫu | Hướng dẫn thay cả cụm `<...>`; từ đó các lệnh gửi cho nhóm điền sẵn giá trị thật khi có thể |

---

## 4. Số liệu

| Chỉ số | Giá trị |
|---|---|
| PR merge | 10 (#58–#66, #68), 0 conflict, 0 force-push |
| CI | 10/10 PR xanh trước khi merge |
| Test tự động | 74 (shared 5, api unit 8, api e2e 19, web 42); tuần 2 là 22 |
| Kiểm tra trình duyệt thật | 13/13 bước |
| Lỗi tìm thấy và sửa trong tuần | 4 (đọc lặp ở trình đọc màn hình, font tiêu đề tiếng Việt, rủi ro test chập chờn, thứ tự migrate trong CI) |
| Phiên bản phải ghim/hạ | `@nestjs/swagger` 11.4.2, `@nestjs/jwt` 11, `@nestjs/passport` 11, `nestjs-zod` 4 |

## 5. Rút kinh nghiệm

1. **PR tách từ `dev` + merge ngay khi CI xanh** hiệu quả hơn hẳn chuỗi PR xếp chồng của tuần 2: không mất thời gian xử lý conflict.
2. **Bản mới nhất chưa chắc dùng được**: cả 4 thư viện mới thêm ở backend (`nestjs-zod`, `@nestjs/swagger`, `@nestjs/jwt`, `@nestjs/passport`) phải chọn bản cũ hơn do không tương thích (zod 3, NestJS 11). Nên kiểm tra `peerDependencies`/`type` trước khi cài, và ghi lý do khi ghim phiên bản.
3. **Test component bắt được lỗi mà mắt thường không thấy** (đọc lặp với trình đọc màn hình). Nên viết test tìm phần tử theo vai trò và tên.
4. **Ảnh chụp màn hình bắt được lỗi mà test không thấy** (lẫn font). Cần cả hai.
5. **Test dùng chung DB phải tự dọn đúng phần của mình** và chạy tuần tự.
6. **Kiểm tra trên trình duyệt thật** cho luồng đăng nhập (chuyển hướng, lưu token, tải lại trang) cho độ tin cậy cao hơn test đơn vị. Nên đưa vào repo dưới dạng Playwright ở W6.
7. **Môi trường máy thành viên** (giới hạn inotify, Compose v1) có thể chặn việc chạy app dù code đúng → đưa vào tài liệu "Lỗi thường gặp".
8. Vẫn tồn đọng: **B và C chưa vào repo**, không có review chéo. Đây là rủi ro lớn nhất cho tuần 4 trở đi.
