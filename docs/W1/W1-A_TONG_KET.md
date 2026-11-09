# Tuần 1: Tổng kết việc của A (W1-A1 → W1-A4)

> Người thực hiện: **A** (Tech Lead) · Ngày: 22–23/10/2026
> Task gốc: [TIMELINE.md, Tuần 1](../TIMELINE.md#tuần-1-nền-tảng) · Quy trình: [EVOLVE_WEB_TEAM_WORKFLOW.vi.md](../EVOLVE_WEB_TEAM_WORKFLOW.vi.md)

## Tóm tắt

| Mã | Task | Kết quả | Issue | PR | Trạng thái |
|---|---|---|---|---|---|
| W1-A1 | Repo GitHub, Projects, nhãn, template PR | Board, labels, 12 issue tuần 1, bảo vệ branch | #2 | – | Done |
| W1-A2 | Dựng monorepo pnpm | `pnpm install` chạy được ở gốc | #3 | #14 | Review |
| W1-A3 | `docker-compose.yml` + `.env.example` | Đã chạy thử: container `healthy`, PostgreSQL 16.15 | #4 | #15 | Review |
| W1-A4 | Contract `packages/shared` | Type, hằng số, zod schema; 4 test pass; import được kiểu ESM và CommonJS | #5 | #16 | Review |

---

## W1-A1: GitHub

**1. Labels** (tạo bằng `gh label create`)

| Nhóm | Label |
|---|---|
| Người làm | `role:A`, `role:B`, `role:C` |
| Phạm vi | `area:web`, `area:api`, `area:shared`, `area:devops` |
| Tuần | `week:1` … `week:6` |
| Khác | `contract-change` (sửa `packages/shared`, cần cả nhóm review), `blocked` |

**2. Project board**: [Evolve Web](https://github.com/users/dungpcaudio9999/projects/1)
- Đã liên kết với repo `dungpcaudio9999/evolve_web`; chế độ private.
- Trường `Status` có 4 cột: **Todo / In Progress / Review / Done**.

**3. Issue tuần 1**: 12 issue (#2–#13), tên dạng `[W1-xx] …`. Mỗi issue có tiêu chí xong, phụ thuộc và label `role`, `week:1`, `area`; tất cả đã đưa lên board.

| Issue | Task | Issue | Task |
|---|---|---|---|
| #2 | W1-A1 | #8 | W1-B3 |
| #3 | W1-A2 | #9 | W1-C1 |
| #4 | W1-A3 | #10 | W1-C2 |
| #5 | W1-A4 | #11 | W1-C3 |
| #6 | W1-B1 | #12 | W1-C4 |
| #7 | W1-B2 | #13 | W1-ALL |

**4. Bảo vệ branch** `main` và `dev`: bắt buộc qua PR, cần 1 người approve, cấm force-push và xoá branch. Phần bắt CI xanh thêm ở W2-A1, khi đã có CI.

**5. Template PR**: đã có sẵn ở `.github/pull_request_template.md`.

---

## W1-A2: Monorepo (branch `feature/W1-A2-monorepo`, PR #14)

| File | Nội dung |
|---|---|
| `pnpm-workspace.yaml` | Workspace gồm `apps/*`, `packages/*` |
| `package.json` | Ghim `pnpm@10.12.1`, Node ≥ 20.11; devDependencies `prettier`, `typescript` |
| `tsconfig.base.json` | Cấu hình TS chung (strict, ES2022) để các package `extends` |
| `.prettierrc`, `.prettierignore` | Nháy đơn, dấu `;`, trailing comma, độ rộng dòng 100 |
| `.editorconfig`, `.nvmrc` | LF, thụt 2 dấu cách; Node 22 |
| `.gitignore` | `node_modules`, `dist`, `.next`, `.env*` (trừ `.env.example`), coverage… |
| `README.md` | Mục yêu cầu, cài đặt, bảng script |

Script ở thư mục gốc:

| Lệnh | Việc |
|---|---|
| `pnpm dev` | Build `@evolve/shared` rồi chạy song song script `dev` của mọi package |
| `pnpm build` / `lint` / `typecheck` / `test` | Chạy script tương ứng của mọi package có script đó |
| `pnpm format` / `format:check` | Prettier |

---

## W1-A3: Docker PostgreSQL (branch `feature/W1-A3-docker-postgres`, PR #15)

- `docker-compose.yml`: service `postgres` (image `postgres:16-alpine`, container `evolve-postgres`), cổng `5432`, volume `postgres-data`, healthcheck `pg_isready`.
- User/pass/db mặc định đều là `evolve`; đổi được qua file `.env` ở thư mục gốc.
- `.env.example`: biến cho docker và mẫu biến cho api, web:

| App | Biến | Mặc định ở local |
|---|---|---|
| gốc (docker) | `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `POSTGRES_PORT` | `evolve`, `evolve`, `evolve`, `5432` |
| api | `DATABASE_URL` | `postgresql://evolve:evolve@localhost:5432/evolve?schema=public` |
| api | `JWT_SECRET`, `JWT_EXPIRES_IN`, `PORT`, `CORS_ORIGIN` | tự đặt, `7d`, `4000`, `http://localhost:3000` |
| web | `NEXT_PUBLIC_API_URL` | `http://localhost:4000` |

**Đã chạy thử (23/10/2026):** `docker compose up -d` → `evolve-postgres` ở trạng thái `healthy`; `psql` trả về `PostgreSQL 16.15`. Trên mạng FPT cần cấu hình proxy cho Docker daemon (xem [REPRODUCE.md](./REPRODUCE.md#lỗi-thường-gặp)).

---

## W1-A4: Contract `packages/shared` (branch `feature/W1-A4-shared-contract`, PR #16)

> **Bản nháp**, chốt ở buổi kickoff (W1-ALL). B review qua #8, C review qua #12.

**Cách build:** tsc build ra `dist/` dạng CommonJS kèm `.d.ts`, nên NestJS chạy trực tiếp được và Next.js import được mà không cần cấu hình thêm. Dùng zod v3 cho hợp với `nestjs-zod`.

| Phần | Nội dung |
|---|---|
| Type | `User` (không có `passwordHash`), `AuthResponse`, `Project`, `Label`, `Issue` (`labels: Label[]`, `rank` lexorank) |
| Hằng số | `STATUSES` (5), `PRIORITIES` (5), `STATUS_BY_ID`, `PRIORITY_BY_ID`, `DEFAULT_STATUS`, `DEFAULT_PRIORITY`, `ISSUE_IDENTIFIER_PREFIX = 'EVO'` |
| Schema | `registerSchema`, `loginSchema`, `createProjectSchema`, `updateProjectSchema`, `createIssueSchema`, `updateIssueSchema`, `moveIssueSchema` (`status`, `afterId`, `beforeId`), `issueFilterSchema` |
| Test | `test/contract.test.js` (`node --test`): 4 test pass |

Quy ước: `id` là string; thời gian là chuỗi ISO 8601; giá trị "chưa có" dùng `null`. Client gửi `labelIds`, server trả về `labels`.

**Câu hỏi cần chốt ở kickoff** (có ghi trong `packages/shared/README.md`):
1. B: `id` dùng `cuid()` hay `uuid()`? Có cần `Issue.creatorId` không?
2. B: `Label` dùng chung toàn hệ thống hay thuộc từng project?
3. C: `Issue` chỉ cần trả về `labels`, hay cần lồng sẵn cả `assignee`/`project`?
4. Cả nhóm: màu trong `STATUSES` đã hợp theme taalas chưa?

---

## Việc còn lại

- [x] Chạy thử `docker compose up -d` (W1-A3): healthy, PostgreSQL 16.15.
- [ ] Merge **#14 trước**. #15 và #16 tách ra từ branch của #14; sau khi xoá branch của #14, GitHub tự chuyển base về `dev`. Vì dùng squash merge nên có thể phải rebase #15, #16 lên `dev`.
- [ ] Merge vào `dev` sẽ **không** tự đóng issue (vì `dev` không phải branch mặc định), nên cần đóng #3, #4, #5 bằng tay.
- [ ] B và C review #16 (W1-B3, W1-C4). A không tự approve được PR của mình.
- [ ] Gán issue cho từng người khi họ đã vào repo.
- [ ] Mỗi máy chạy `corepack enable` một lần để có lệnh `pnpm`.
- [ ] Họp kickoff (W1-ALL): chốt 4 câu hỏi contract, rồi merge #16.
