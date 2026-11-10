# Tuần 4: Hướng dẫn chạy, dùng thử và phát triển tiếp

> Dành cho: cả nhóm (A, B, C) · Áp dụng cho `dev` từ commit `9153543` (sau PR #88)
> Liên quan: [Báo cáo tuần 4](README.md) · [Nhật ký](NHAT_KY.md) · [Hướng dẫn tuần 3](../W3/HUONG_DAN.md) (cài đặt, đăng nhập, lỗi thường gặp 1–11)

Tài liệu này chỉ ghi **phần mới của tuần 4**. Cài đặt công cụ, chạy app, đăng nhập và các lỗi thường gặp cũ xem [hướng dẫn tuần 3](../W3/HUONG_DAN.md).

> **Quy ước:** lệnh chạy ở thư mục gốc `evolve_web/`. Chỗ có `<...>` phải thay **cả cụm, kể cả dấu `< >`**.

---

## Phần 1: Chạy và dùng thử

### Bước 1. Lấy code và cập nhật database

```bash
git switch dev && git pull --ff-only origin dev
pnpm install
pnpm --filter api db:migrate
pnpm --filter api db:seed        # XÓA dữ liệu cũ, nạp lại dữ liệu mẫu
pnpm dev
```
Mở http://localhost:3000, đăng nhập `an@evolve.dev` / `password123`.

> Từ tuần 4 **mọi thao tác đều lưu vào database**. Muốn quay về dữ liệu ban đầu thì chạy lại `db:seed`.

### Bước 2. Thử các tính năng mới

| Ở đâu | Thử | Kết quả đúng |
|---|---|---|
| `/issues` | Tải lại trang (F5) sau khi đổi trạng thái một issue | Trạng thái mới vẫn còn |
| `/issues` | Nhấn **C**, nhập tiêu đề, chọn nhãn (chọn được nhiều), **Tạo issue** | Thông báo "Đã tạo EVO-16"; tải lại vẫn còn |
| `/issues` | **Chuột phải** vào một dòng | Menu: Mở, Trạng thái ▸, Độ ưu tiên ▸, Xóa issue… |
| `/issues` | Chuột phải → **Xóa issue…** | Hộp thoại xác nhận; **Hủy** thì không xóa |
| `/issues` | Bấm vào **tiêu đề** một issue | Mở trang chi tiết `/issues/<id>` |
| `/issues/<id>` | Sửa tiêu đề rồi Enter (hoặc bấm ra ngoài); **Esc** để hủy | Lưu ngay; tải lại vẫn giữ |
| `/issues/<id>` | Gõ mô tả rồi bấm ra ngoài | Lưu |
| `/issues/<id>` | Đổi trạng thái / độ ưu tiên / người làm / nhãn ở panel phải | Lưu ngay |
| `/projects` | **New project**, key trùng `EVO` | Lỗi "Key đã được dùng…" ngay dưới ô Key |
| `/projects` | Tạo project mới | Chuyển sang trang chi tiết project |
| `/projects/<id>` | **New issue** | Modal chọn sẵn project này; mã issue dạng `<KEY>-1` |
| `/projects/<id>` | **Sửa** | Đổi tên, icon, màu; ô Key bị khóa |
| `/projects/<id>` | **Xóa** | Cảnh báo "toàn bộ N issue" sẽ bị xóa |
| Đăng xuất → đăng nhập `binh@evolve.dev` | Xem `/issues`, `/projects` | Chỉ thấy MOB, không thấy dữ liệu của An |

### Bước 3. Thử API issues

Swagger: http://localhost:4000/docs → **Authorize** bằng token (cách lấy token xem hướng dẫn tuần 3). Hoặc curl:

```bash
TOKEN=$(curl -s -X POST localhost:4000/auth/login -H 'Content-Type: application/json' \
  -d '{"email":"an@evolve.dev","password":"password123"}' | sed 's/.*"accessToken":"\([^"]*\)".*/\1/')
H="Authorization: Bearer $TOKEN"

curl -s localhost:4000/issues -H "$H" | head -c 300; echo                    # 15 issue EVO
curl -s "localhost:4000/issues?status=TODO&priority=URGENT" -H "$H"; echo     # lọc
curl -s "localhost:4000/issues?q=evo-1" -H "$H" | head -c 200; echo           # tìm trong tiêu đề và mã (có dấu phải gõ đúng dấu)
PID=$(curl -s localhost:4000/projects -H "$H" | sed 's/.*"id":"\([^"]*\)".*/\1/')
curl -s -X POST localhost:4000/issues -H "$H" -H 'Content-Type: application/json' \
  -d "{\"title\":\"Tạo từ curl\",\"projectId\":\"$PID\"}"; echo               # EVO-16
```

| Endpoint | Ghi chú |
|---|---|
| `GET /issues?projectId&status&priority&assigneeId&q` | Chỉ issue trong project của mình; `q` tìm trong tiêu đề **và** mã, không phân biệt hoa thường (nhưng **phân biệt dấu**: `dang nhap` không khớp `đăng nhập`) |
| `POST /issues` | Mặc định `BACKLOG`, `NO_PRIORITY`; tự sinh mã; project người khác → 404; người làm không tồn tại → 400 |
| `GET/PATCH/DELETE /issues/:id` | Người khác → 404; đổi trạng thái → xuống cuối cột; `labelIds` thay toàn bộ nhãn; `projectId` bị bỏ qua; xóa → 204 |
| `GET /users`, `GET /labels` | Danh sách để chọn người làm, nhãn |

### Bước 4. Chạy test

```bash
pnpm test                                          # 121 test: shared 5 · api 8 + 36 · web 72
pnpm --filter api test:e2e                         # chỉ e2e api (cần PostgreSQL)
pnpm --filter web test -- issue-detail             # chạy riêng một file test web
```

---

## Phần 2: Phát triển tiếp (tuần 5)

### 2.1 Store gọi API: mẫu cần theo

```ts
// Sửa/xóa: cập nhật ngay, gọi API, lỗi thì hoàn tác (api-client đã hiện toast)
updateIssue: async (id, patch) => {
  const before = get().issues.find((i) => i.id === id);
  set({ issues: upsert(get().issues, { ...before, ...patch }) });
  try {
    set({ issues: upsert(get().issues, await api.patch<Issue>(`/issues/${id}`, patch)) });
  } catch {
    set({ issues: upsert(get().issues, before) });
  }
},
```
Xem đầy đủ ở `apps/web/store/issues-store.ts`. **Kéo thả (W5-C)**: `moveIssue` đã tính rank tạm trên trình duyệt; chỉ cần thêm gọi `api.patch('/issues/:id/move', { status, afterId, beforeId })` theo đúng mẫu trên.

### 2.2 API: mẫu cho route mới (W5-B: `/issues/:id/move`)

- Kiểm tra quyền bằng `findOwned()` có sẵn trong `apps/api/src/modules/issues/issues.service.ts` (người khác → 404).
- Tính rank bằng `@kayron013/lexorank`: `LexoRank.between(rankCủaAfter, rankCủaBefore)`; chỉ có một bên thì đặt trước/sau bên đó; cả hai trống thì `rankAfter(null)` (`src/common/utils/rank.ts`).
- DTO: `createZodDto(moveIssueSchema)` (schema có sẵn trong `@evolve/shared`).
- Thêm e2e vào `test/issues.e2e-spec.ts`.

### 2.3 Web: dùng lại component tuần 4

| Component | Dùng khi |
|---|---|
| `IssueContextMenu` + `DeleteIssueDialog` | Board cũng cần chuột phải / xóa → bọc thẻ issue trên board |
| `LabelSelector` | Chọn nhiều nhãn ở chỗ khác (filter bar) |
| `EditableTitle` | Sửa tên tại chỗ ở chỗ khác |
| `ProjectIcon`, `ProjectFormModal` | Hiện/sửa project |
| `useUiStore().openCreateIssue(projectId?)` | Mở modal tạo issue, chọn sẵn project |
| `useProjectsStore`, `useIssuesStore` | Dữ liệu; **đừng** gọi `api` trực tiếp trong component |

### 2.4 Quy tắc khi thêm dữ liệu theo người dùng
Store nào giữ dữ liệu riêng của người dùng thì phải có `reset()` và được gọi trong `clearUserData()` ở `apps/web/store/auth-store.ts`, nếu không người đăng nhập sau sẽ thấy dữ liệu của người trước.

---

## Phần 3: Lỗi thường gặp (mới ở tuần 4)

Lỗi 1–11 (inotify, Docker Compose v1, `@nestjs/swagger`, `@nestjs/jwt`, cổng bị chiếm…) xem [hướng dẫn tuần 3](../W3/HUONG_DAN.md#phần-3-lỗi-thường-gặp).

### Lỗi 12: Danh sách issue trống hoặc "Không tải được danh sách issue"
API chưa chạy hoặc DB chưa có dữ liệu. Kiểm tra `curl localhost:4000/health` (phải `"db":"up"`), rồi chạy `pnpm --filter api db:seed`. Bấm **Thử lại** trên trang.

### Lỗi 13: Đăng nhập Bình/Chi không thấy issue được giao cho mình
Đúng thiết kế hiện tại: chỉ **chủ project** thấy issue của project. Bình thấy MOB vì Bình là chủ MOB. Xem mục 3 báo cáo tuần 4.

### Lỗi 14: Tạo project báo "Key đã được dùng cho project khác của bạn"
Key là duy nhất **trong các project của bạn** (người khác dùng cùng key được). Chọn key khác; key 2–5 ký tự, bắt đầu bằng chữ.

### Lỗi 15: Sau `git pull`, test web lỗi "Cannot find module" hoặc thiếu component
Có thư viện / component mới (vd. `alert-dialog`). Chạy `pnpm install`.

### Lỗi 16: Trang chi tiết báo "Không tìm thấy issue/project"
Issue/project đã bị xóa, thuộc người khác, hoặc DB vừa được seed lại (id đổi). Quay lại danh sách và mở lại.

### Lỗi 17: Đã chạy lại `db:seed` nhưng trình duyệt vẫn hiện dữ liệu cũ / báo lỗi
Seed xóa và tạo lại người dùng nên token cũ không còn hợp lệ → app tự đăng xuất ở lần gọi API tiếp theo. Đăng nhập lại.
