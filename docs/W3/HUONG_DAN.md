# Tuần 3: Hướng dẫn chạy, dùng thử và phát triển tiếp

> Dành cho: cả nhóm (A, B, C) · Áp dụng cho code trên `dev` từ commit `c337314` (sau PR #68)
> Liên quan: [Báo cáo tuần 3](README.md) · [Nhật ký thực hiện](NHAT_KY.md) · [Quy trình Git](../EVOLVE_WEB_TEAM_WORKFLOW.vi.md)

Tài liệu gồm 3 phần:
1. **Chạy và kiểm tra** kết quả tuần 3 trên máy mình.
2. **Phát triển tiếp**: cách dùng những gì tuần 3 đã làm (auth, api-client, selector…) khi viết code tuần 4.
3. **Lỗi thường gặp** và cách sửa.

> **Quy ước lệnh:** mọi lệnh chạy ở thư mục gốc repo `evolve_web/` trừ khi ghi khác. Chỗ nào có `<...>` là chỗ phải **thay cả cụm, kể cả dấu `< >`**, ví dụ `<số-PR>` → `69`.

---

## Phần 1: Chạy và kiểm tra

### Bước 1. Công cụ cần có

| Công cụ | Kiểm tra | Ghi chú |
|---|---|---|
| Node.js ≥ 20 (khuyên 22) | `node -v` | |
| pnpm 10 | `pnpm -v` | Chưa có: `corepack enable pnpm` |
| Docker + **Compose v2** | `docker compose version` | Bản `docker-compose` v1 không chạy với Docker Engine mới, xem [Lỗi 2](#lỗi-2-docker-compose-v1-báo-client-version-is-too-old) |
| Giới hạn inotify đủ lớn (Linux) | `cat /proc/sys/fs/inotify/max_user_instances` | Nên ≥ 1024, xem [Lỗi 1](#lỗi-1-web-không-mở-được-os-file-watch-limit-reached) |

### Bước 2. Lấy code mới nhất

```bash
git switch dev
git pull --ff-only origin dev
pnpm install
```

### Bước 3. Database

```bash
docker compose up -d                          # PostgreSQL 16 ở localhost:5432
cp -n apps/api/.env.example apps/api/.env     # -n: không ghi đè nếu đã có
pnpm --filter api db:migrate                  # tạo/cập nhật bảng
pnpm --filter api db:seed                     # XÓA dữ liệu cũ, nạp dữ liệu mẫu
```

Kết quả seed đúng: `Seed xong: 3 users, 2 projects, 30 issues, 5 labels`.

### Bước 4. Chạy API và web

```bash
pnpm dev
```

Chờ đủ **hai** dòng:
- `apps/api dev: API đang chạy tại http://localhost:4000 (Swagger: /docs)`
- `apps/web dev: ✓ Ready in …`

> Chỉ thấy dòng của API mà không thấy `✓ Ready` của web → xem [Lỗi 1](#lỗi-1-web-không-mở-được-os-file-watch-limit-reached).

Có thể chạy riêng từng app trong hai terminal: `pnpm --filter api dev` và `pnpm --filter web dev`.

### Bước 5. Dùng thử trên web: http://localhost:3000

Tài khoản mẫu (mật khẩu đều là `password123`):

| Email | Ghi chú |
|---|---|
| `an@evolve.dev` | Chủ project `EVO` |
| `binh@evolve.dev` | Chủ project `MOB` |
| `chi@evolve.dev` | Chưa có project |

| Thử | Kết quả đúng |
|---|---|
| Mở http://localhost:3000/issues khi chưa đăng nhập | Bị chuyển sang `/login?next=%2Fissues` |
| Đăng nhập với mật khẩu sai | Dòng đỏ "Sai email hoặc mật khẩu" dưới ô mật khẩu |
| Đăng nhập đúng | Vào `/issues`, cuối sidebar có tên người dùng |
| Tải lại trang (F5) | Vẫn đăng nhập |
| Mở `/login` khi đã đăng nhập | Tự chuyển về `/issues` |
| Bấm icon trạng thái / độ ưu tiên / avatar ở một dòng | Mở danh sách chọn, gõ để lọc, Enter để chọn |
| Nhấn phím **C** (khi không gõ trong ô nhập) hoặc nút **New issue** | Mở modal tạo issue; tạo xong hiện thông báo "Đã tạo EVO-16" |
| Bấm tên ở cuối sidebar → **Đăng xuất** | Về `/login` |
| Đăng ký tài khoản mới ở `/register` với email đã có | Lỗi "Email đã được dùng" dưới ô email |

> **Lưu ý:** danh sách issue hiện là **dữ liệu mẫu trong trình duyệt**. Issue tạo/sửa chưa lưu vào DB, tải lại trang là mất. Nối API issue là việc của tuần 4.

### Bước 6. Dùng thử API

**Cách 1: Swagger** tại http://localhost:4000/docs
1. Mở `POST /auth/login` → **Try it out** → body `{"email":"an@evolve.dev","password":"password123"}` → **Execute**.
2. Copy giá trị `accessToken` trong kết quả.
3. Bấm **Authorize** (góc trên phải) → dán token → **Authorize**.
4. Gọi thử `GET /auth/me`, `GET /projects`, `POST /projects`…

**Cách 2: curl**
```bash
TOKEN=$(curl -s -X POST localhost:4000/auth/login -H 'Content-Type: application/json' \
  -d '{"email":"an@evolve.dev","password":"password123"}' | sed 's/.*"accessToken":"\([^"]*\)".*/\1/')

curl -s localhost:4000/auth/me -H "Authorization: Bearer $TOKEN"; echo
curl -s localhost:4000/projects -H "Authorization: Bearer $TOKEN"; echo       # An chỉ thấy EVO
curl -s localhost:4000/projects; echo                                          # không token → 401
curl -s -X POST localhost:4000/projects -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' -d '{"name":"","key":"1"}'; echo         # 400 kèm lỗi từng trường
```

| Endpoint | Cần token | Kết quả |
|---|---|---|
| `GET /health` | Không | `{"status":"ok","db":"up",…}` |
| `POST /auth/register` | Không | 201 `{ accessToken, user }`; email trùng 409 |
| `POST /auth/login` | Không | 200 `{ accessToken, user }`; sai 401 |
| `GET /auth/me` | Có | Người dùng hiện tại |
| `GET /projects`, `POST /projects` | Có | Chỉ project của mình; key trùng 409 |
| `GET/PATCH/DELETE /projects/:id` | Có | Không phải chủ → 404; xóa → 204 |

### Bước 7. Chạy test

```bash
pnpm test                         # tất cả: shared 5 · api unit 8 + e2e 19 · web 42
pnpm --filter api test            # api (e2e cần PostgreSQL đang chạy)
pnpm --filter web test            # web (logic + component)
pnpm --filter web test:watch      # chạy lại khi sửa code
```

Kiểm tra đầy đủ như CI trước khi tạo PR:
```bash
pnpm build && pnpm typecheck && pnpm lint && pnpm test && pnpm format:check
```

---

## Phần 2: Phát triển tiếp trên nền tuần 3

### 2.1 API: thêm route cần đăng nhập (B)

```ts
// src/modules/issues/issues.controller.ts
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, type AuthUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateIssueDto } from './dto/issue.dto';

@ApiTags('issues')
@ApiBearerAuth()                 // hiện ổ khóa trên Swagger
@UseGuards(JwtAuthGuard)         // thiếu/sai token → 401
@Controller('issues')
export class IssuesController {
  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateIssueDto) {
    // user.id là người đang đăng nhập
  }
}
```

```ts
// src/modules/issues/dto/issue.dto.ts: DTO lấy thẳng từ contract, không viết lại quy tắc
import { createIssueSchema } from '@evolve/shared';
import { createZodDto } from 'nestjs-zod';
export class CreateIssueDto extends createZodDto(createIssueSchema) {}
```

Những thứ **đã có sẵn**, chỉ cần dùng:

| Có sẵn | Ở đâu | Tác dụng |
|---|---|---|
| `ZodValidationPipe` (global) | `src/app.module.ts` | Body sai → 400 `{ message: "Dữ liệu không hợp lệ", errors: { field: [...] } }` |
| `AllExceptionsFilter` (global) | `src/common/filters/` | Mọi lỗi cùng một dạng; lỗi Prisma P2002/P2025/P2003 → 409/404/400 |
| `JwtAuthGuard`, `@CurrentUser()` | `src/modules/auth/`, `src/common/decorators/` | Bảo vệ route, lấy user |
| `toUser()`, `toProject()` | `src/common/utils/` | Chuyển bản ghi DB sang type contract, bỏ trường nội bộ |
| `PrismaService` (global) | `src/prisma/` | Inject thẳng vào service, không cần import module |

Quy tắc: ném `NotFoundException`, `ConflictException`… thay vì tự trả JSON lỗi; không bao giờ trả `passwordHash`; dữ liệu người khác → 404.

**Test e2e cần DB:** đặt file ở `apps/api/test/*.e2e-spec.ts`, mẫu là `projects.e2e-spec.ts`. Mỗi bộ test **chỉ xóa dữ liệu do chính nó tạo** (vì các bộ dùng chung DB). Không có `DATABASE_URL` thì dùng `describe.skip`.

### 2.2 Web: gọi API (C)

Chỉ **store** gọi API; component gọi hàm của store.

```ts
import type { Issue } from '@evolve/shared';
import { api, ApiError } from '@/lib/api-client';

const issues = await api.get<Issue[]>('/issues', { query: { projectId } });
const created = await api.post<Issue>('/issues', input);
await api.patch<Issue>(`/issues/${id}`, patch);
await api.delete(`/issues/${id}`);
```

- Token tự gắn vào header. Lỗi → `ApiError { status, message, errors }` và **tự hiện toast**.
- Form tự hiển thị lỗi thì truyền `{ toastOnError: false }`, rồi dùng `applyApiError(error, setError, { 409: 'email' })` (`components/auth/apply-api-error.ts`).
- API trả 401 → token bị xóa và người dùng tự bị đăng xuất (đã nối sẵn trong `AuthGuard`).

### 2.3 Web: lấy người dùng hiện tại

```ts
import { useAuthStore } from '@/store/auth-store';
const user = useAuthStore((s) => s.user);         // chỉ chạy được bên trong (main)/…
const logout = useAuthStore((s) => s.logout);
```
Trang mới đặt trong `app/(main)/…` là tự được bảo vệ, không cần làm gì thêm.

### 2.4 Web: dùng lại component tuần 3

| Component | Dùng khi | Ví dụ |
|---|---|---|
| `StatusSelector`, `PrioritySelector`, `AssigneeSelector` | Đổi giá trị bằng popover có tìm kiếm | `<StatusSelector value={s} onChange={setS} showLabel />` |
| `SelectorPopover` | Làm selector mới (labels, project…) | Xem `components/issues/project-selector.tsx` |
| `useHotkey('k', fn)` | Phím tắt một phím, tự bỏ qua khi đang gõ | `hooks/use-hotkey.ts` |
| `useUiStore().openCreateIssue()` | Mở modal tạo issue từ chỗ khác | `components/issues/new-issue-button.tsx` |
| `FormField` | Ô nhập có nhãn + lỗi | `app/(auth)/login/page.tsx` |
| `toast.success/error` (sonner) | Thông báo nhỏ | `import { toast } from 'sonner'` |

Hai lưu ý giao diện:
- Icon nằm cạnh chữ cùng nghĩa → truyền `decorative` để trình đọc màn hình không đọc lặp.
- Tiêu đề **tiếng Việt** thêm `font-sans` (font tiêu đề Panchang không có chữ Việt có dấu).

### 2.5 Web: viết test component

```tsx
// @vitest-environment jsdom          ← BẮT BUỘC ở dòng đầu file *.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { StatusSelector } from './status-selector';

it('chọn trạng thái', async () => {
  const onChange = vi.fn();
  render(<StatusSelector value="TODO" onChange={onChange} />);
  await userEvent.click(screen.getByRole('button', { name: 'Trạng thái: Todo' }));
  await userEvent.click(screen.getByRole('option', { name: 'Done' }));
  expect(onChange).toHaveBeenCalledWith('DONE');
});
```
Tìm phần tử theo **vai trò và tên** (`getByRole('button', { name })`) giống người dùng thật/trình đọc màn hình. Mẫu: `components/issues/selectors.test.tsx`, `app/(auth)/login/login.test.tsx`.

### 2.6 Quy trình đưa code lên (tóm tắt)

```bash
git switch dev && git pull --ff-only origin dev
git switch -c feature/W4-B1-issues-api              # tên branch theo mã task
# … code, test …
pnpm build && pnpm typecheck && pnpm lint && pnpm test && pnpm format:check
git add <các-file> && git commit -m "feat(api): add issues module"
git push -u origin feature/W4-B1-issues-api
gh pr create --base dev --title "[W4-B1] Module issues" --body "Closes #<số-issue>"
```
Chi tiết: [EVOLVE_WEB_TEAM_WORKFLOW.vi.md](../EVOLVE_WEB_TEAM_WORKFLOW.vi.md). Mỗi task một PR tách từ `dev` mới nhất, **không xếp chồng PR** (bài học tuần 2).

---

## Phần 3: Lỗi thường gặp

### Lỗi 1: Web không mở được, "OS file watch limit reached"
Trình duyệt báo "fail to load page"; terminal chỉ có log của API; khi chạy riêng web thấy `TurbopackInternalError: OS file watch limit reached`.

Nguyên nhân: Linux hết giới hạn theo dõi file (inotify), thường vì mở nhiều VS Code / chương trình `--watch`. Sửa (cần `sudo`):
```bash
sudo sysctl -w fs.inotify.max_user_instances=1024
sudo sysctl -w fs.inotify.max_user_watches=524288
# Giữ sau khi khởi động lại:
echo -e "fs.inotify.max_user_instances=1024\nfs.inotify.max_user_watches=524288" | sudo tee /etc/sysctl.d/60-inotify.conf
sudo sysctl --system
```
Không có `sudo`: chạy web ở chế độ production (không theo dõi file, sửa code phải build lại):
```bash
pnpm --filter web build && pnpm --filter web start
```

### Lỗi 2: docker-compose v1 báo client version is too old
Cài Compose v2 và dùng lệnh `docker compose` (có dấu cách): `sudo apt install docker-compose-v2`. Tạm thời có thể chạy PostgreSQL bằng `docker run`, xem phụ lục của [docs/W2/README.md](../W2/README.md).

### Lỗi 3: Đăng nhập báo "Không kết nối được máy chủ"
API không chạy hoặc web gọi sai địa chỉ. Kiểm tra `curl localhost:4000/health`; nếu đổi cổng API thì sửa `NEXT_PUBLIC_API_URL` trong `apps/web/.env.local` rồi chạy lại web.

### Lỗi 4: `/health` trả `"db":"down"`
PostgreSQL chưa chạy hoặc `DATABASE_URL` sai. `docker compose ps` phải là `healthy`; kiểm tra `apps/api/.env`.

### Lỗi 5: Test e2e của API bị bỏ qua
Thấy "Bỏ qua auth e2e: chưa có DATABASE_URL" → chưa có `apps/api/.env`. Tạo từ `.env.example` và chạy `db:migrate`.

### Lỗi 6: `Cannot find module '@nestjs/swagger/dist/services/schema-object-factory'`
Ai đó đã nâng `@nestjs/swagger` lên ≥ 11.4.3. **Giữ đúng `11.4.2`** trong `apps/api/package.json` (lý do ở `apps/api/README.md`).

### Lỗi 7: `Must use import to load ES Module … @nestjs/jwt`
Đã cài `@nestjs/jwt`/`@nestjs/passport` bản 12 (chỉ ESM, cho NestJS 12). Dùng bản 11: `pnpm --filter api add @nestjs/jwt@^11 @nestjs/passport@^11`.

### Lỗi 8: `Port 3000/4000 is already in use`
Một bản cũ còn chạy. Tìm và tắt: `fuser -k 3000/tcp 4000/tcp` (hoặc `lsof -i :3000`).

### Lỗi 9: Lệnh báo `bash: số-PR: No such file or directory` / `syntax error near unexpected token 'newline'`
Đã copy nguyên chỗ giữ chỗ `<...>` trong lệnh mẫu. Thay cả cụm kể cả dấu `< >` bằng giá trị thật.

### Lỗi 10: Đăng nhập xong vẫn bị đẩy về `/login`
Token trong trình duyệt hỏng hoặc `JWT_SECRET` đã đổi sau khi đăng nhập. Đăng xuất rồi đăng nhập lại, hoặc xóa `evolve.accessToken` trong DevTools → Application → Local Storage.

### Lỗi 11: Vừa pull code mới, API báo lỗi bảng/cột không tồn tại
Có migration mới. Chạy `pnpm install && pnpm --filter api db:migrate`.
