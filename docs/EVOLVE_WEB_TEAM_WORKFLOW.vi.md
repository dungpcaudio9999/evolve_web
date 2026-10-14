# Evolve Web – Quy trình làm việc nhóm

> 🇬🇧 Bản tiếng Anh: [EVOLVE_WEB_TEAM_WORKFLOW.md](./EVOLVE_WEB_TEAM_WORKFLOW.md)
> Liên quan: [ROLES.md](./ROLES.md) · [TIMELINE.md](./TIMELINE.md)

Tài liệu này quy định quy trình phối hợp cho mọi thành viên của dự án `evolve_web`.

## 1. Mô hình branch

```text
main ◄──── PR release (cuối mỗi tuần / mỗi milestone)
 │
 └── dev ◄──── PR + review (mỗi task)
      │
      ├── feature/<mã-task>-<tên>
      ├── fix/<mã-task>-<tên>
      ├── refactor/<phạm-vi>
      └── docs/<chủ-đề>
```

| Branch | Mục đích | Deploy |
|---|---|---|
| `main` | Nhánh ổn định; chỉ nhận merge từ `dev` | Production (Vercel + Render) |
| `dev` | Nhánh tích hợp cho quá trình phát triển | Preview |
| `feature/*` | Tính năng hoặc task mới | – |
| `fix/*` | Sửa lỗi | – |
| `refactor/*` | Sửa cấu trúc code, không đổi hành vi | – |
| `docs/*` | Thay đổi tài liệu | – |

**Đặt tên branch:** kèm mã task trong [TIMELINE.md](./TIMELINE.md), để từ branch hay PR đều tra ngược ra được task.

```text
feature/W3-C2-issue-create
feature/W3-B1-auth-api
feature/W5-C1-board-drag-drop
fix/W6-A2-login-redirect
docs/api-endpoints
```

### Bảo vệ branch (nhóm trưởng cấu hình trên GitHub)

Áp dụng cho cả `main` và `dev`:
- Bắt buộc qua Pull Request, không cho push trực tiếp.
- Cần ít nhất **1 người approve**.
- CI phải xanh (lint, typecheck, build, test).

---

## 2. Quy trình hằng ngày

```text
Nhận task → Cập nhật dev → Tạo branch → Code → Kiểm tra ở máy
→ Commit → Push → Pull Request → Review → Squash merge → Dọn dẹp
```

### Bước 1: Cập nhật `dev` và môi trường

```bash
git switch dev
git pull --ff-only origin dev

# Đồng bộ thư viện và schema database (monorepo + Prisma)
pnpm install
pnpm --filter api prisma migrate dev
```

> Nếu `git pull --ff-only` báo lỗi, nhiều khả năng bạn đã lỡ commit thẳng lên `dev` ở máy mình. Đừng dùng lệnh ép buộc (force), hãy hỏi nhóm trưởng.

### Bước 2: Tạo branch cho task

```bash
git switch -c feature/W3-C2-issue-create
```

### Bước 3: Code và kiểm tra ở máy

Trước khi commit, chạy các kiểm tra liên quan đến phần mình sửa:

```bash
pnpm lint
pnpm typecheck
pnpm build
pnpm test        # nếu phần code đó có test
```

### Bước 4: Commit

Xem lại thay đổi trước, sau đó **chỉ add những file liên quan đến task**:

```bash
git status
git diff
git add apps/web/components/issues/create-issue-modal.tsx
git commit -m "feat(issue): add create issue modal"
```

> Tránh dùng `git add .` khi chưa xem kỹ. Tuyệt đối không commit file `.env` (chứa bí mật như `DATABASE_URL`, `JWT_SECRET`); chỉ commit `.env.example`.

Định dạng commit message ([Conventional Commits](https://www.conventionalcommits.org/)):

```text
feat(scope): mô tả        # tính năng mới
fix(scope): mô tả         # sửa lỗi
refactor(scope): mô tả    # sửa code, không đổi hành vi
docs(scope): mô tả        # tài liệu
test(scope): mô tả        # test
chore(scope): mô tả       # cấu hình, thư viện, công cụ
```

Các scope hay dùng: `web`, `api`, `shared`, `issue`, `project`, `auth`, `board`, `ci`.

### Bước 5: Cập nhật branch theo `dev`

Nếu `dev` đã thay đổi trong lúc bạn đang làm (đặc biệt là trước khi tạo PR):

```bash
git fetch origin
git rebase origin/dev
# Nếu có conflict:
#   sửa các file bị conflict → git add <file> → git rebase --continue
#   muốn hủy: git rebase --abort
git push --force-with-lease
```

> Chỉ rebase **branch task của chính mình**. Không bao giờ rebase hay force-push `dev` hoặc `main`.
> Nếu chưa quen rebase, dùng `git merge origin/dev` cũng được.

### Bước 6: Push branch

```bash
git push -u origin feature/W3-C2-issue-create
# những lần sau:
git push
```

---

## 3. Pull Request và Review

### Tạo PR

- **Đích:** `dev`.
- **Tiêu đề:** `[W3-C2] Create issue modal`.
- **Mô tả** (theo template PR):
  - Thay đổi gì và vì sao
  - Cách test
  - Ảnh chụp màn hình / GIF nếu có thay đổi giao diện
  - `Closes #<số issue>` để task tự chuyển sang **Done**
- Mỗi PR chỉ làm **một task**. PR quá lớn rất khó review; nếu cần thì tách nhỏ.
- Có thể tạo **Draft PR** sớm nếu muốn được góp ý trước khi làm xong.

### Review

| Người tạo PR | Người review |
|---|---|
| B hoặc C | A (nhóm trưởng) |
| A | B hoặc C |

```text
Developer ── tạo PR ──► Reviewer
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
           Approve                Yêu cầu sửa
              │                         │
              │                Developer sửa + push
              │                         │
              │                    Review lại
              ▼                         │
       Squash and merge ◄───────────────┘
              │
              ▼
             dev
```

- Người review phản hồi trong vòng **24 giờ**.
- Không merge khi còn comment chưa giải quyết hoặc CI đang đỏ.
- Cách merge: **Squash and merge** (mỗi PR thành một commit trên `dev`).

### Quy tắc đặc biệt

- PR có sửa **`packages/shared`** (contract giữa frontend và backend) phải tag **cả nhóm** và cần nhóm trưởng duyệt.
- **Chỉ B (backend) tạo migration Prisma.** Ai cần đổi schema thì nhờ B, để tránh hai migration xung đột nhau.
- Không commit bí mật, `node_modules` hay thư mục build.

### Sau khi merge

```bash
git switch dev
git pull --ff-only origin dev
git branch -d feature/W3-C2-issue-create   # xóa branch ở máy
git fetch --prune                          # dọn các branch đã xóa trên GitHub
```

---

## 4. Release: `dev` → `main`

Cuối mỗi tuần, khi đạt milestone trong [TIMELINE.md](./TIMELINE.md):

1. Nhóm trưởng tạo PR `dev → main` với tiêu đề `Release M<n>`.
2. CI phải xanh; cả nhóm kiểm tra bản preview.
3. Merge bằng **Create a merge commit** (để `main` và `dev` luôn đồng bộ).
4. Gắn tag phiên bản:
   ```bash
   git switch main && git pull --ff-only origin main
   git tag v0.<n>
   git push origin v0.<n>
   ```
5. Production tự động deploy từ `main`.

**Sửa lỗi gấp trên production:** vẫn tạo `fix/*` từ `dev`, merge vào `dev`, rồi tạo PR release `dev → main`. Không commit thẳng vào `main`.

---

## 5. Quy tắc nhóm (tóm tắt)

1. Không bao giờ push thẳng lên `main` hoặc `dev`.
2. Một task = một branch = một PR.
3. Luôn bắt đầu từ `dev` mới nhất, sau đó chạy `pnpm install` và `prisma migrate dev`.
4. Tên branch và tên PR có mã task (`W3-C2`).
5. Chạy lint / typecheck / build trước khi push.
6. Chỉ commit file liên quan; không bao giờ commit `.env`.
7. Mỗi PR cần 1 người approve và CI xanh mới được merge.
8. Sửa contract (`packages/shared`) thì phải báo cả nhóm.
9. Chỉ thành viên backend tạo migration Prisma.
10. Bị vướng quá **2 giờ** thì hỏi ngay trong nhóm chat.

---

## 6. Tra cứu nhanh

```bash
# 1. Bắt đầu task
git switch dev && git pull --ff-only origin dev
pnpm install && pnpm --filter api prisma migrate dev
git switch -c feature/<mã-task>-<tên>

# 2. Code, kiểm tra, commit
pnpm lint && pnpm typecheck && pnpm build
git status && git diff
git add <các-file>
git commit -m "feat(scope): mô tả"

# 3. Cập nhật theo dev và push
git fetch origin && git rebase origin/dev
git push -u origin feature/<mã-task>-<tên>      # hoặc: git push --force-with-lease sau khi rebase

# 4. Tạo PR → dev, chờ review, squash and merge

# 5. Dọn dẹp
git switch dev && git pull --ff-only origin dev
git branch -d feature/<mã-task>-<tên> && git fetch --prune
```

> **Nguyên tắc:** mỗi thành viên làm độc lập trên branch task ngắn hạn; `dev` là nhánh tích hợp chung; `main` chỉ nhận các bản đã kiểm tra ở mỗi milestone.
