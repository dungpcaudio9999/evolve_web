# Tuần 1: Hướng dẫn tái hiện kết quả (W1-A1 → W1-A4)

> Đi kèm: [W1-A_TONG_KET.md](./W1-A_TONG_KET.md) (tổng kết kết quả tuần 1)

Tài liệu có hai phần:
- **Phần 1: Kiểm tra kết quả ở máy mình.** Phần này dùng nhiều nhất: clone repo, chạy lại và xác nhận từng task đạt "tiêu chí xong".
- **Phần 2: Làm lại từ đầu.** Dùng các lệnh đã chạy để dựng lại toàn bộ trên một repo mới hoặc repo thử.

> ⚠️ Chỉ chạy Phần 2 trên repo mới hoặc repo thử. Chạy lại trên repo thật sẽ tạo trùng project board và issue.

---

## Phần 1: Kiểm tra kết quả ở máy mình

### Bước 1. Chuẩn bị công cụ

```bash
node -v
```
In phiên bản Node.js. Cần **≥ 20.11**, khuyến nghị 22 (ghi trong `.nvmrc`). Nếu dùng nvm thì chạy `nvm use` trong thư mục repo để chuyển đúng phiên bản.

```bash
corepack enable
```
Corepack đi kèm Node. Lệnh này cài lệnh `pnpm`. Khi chạy, pnpm đọc `"packageManager": "pnpm@10.12.1"` trong `package.json`, nên cả nhóm dùng **cùng một phiên bản** pnpm. Chỉ cần chạy một lần trên mỗi máy.

> Nếu báo lỗi quyền (permission denied): dùng `npx pnpm@10.12.1 <lệnh>` thay cho `pnpm <lệnh>` ở mọi bước bên dưới.

```bash
pnpm -v          # phải in 10.12.1
docker -v        # chỉ cần cho W1-A3
gh auth status   # chỉ cần cho Phần 2 (thao tác GitHub)
```

### Bước 2. Lấy code

```bash
git clone https://github.com/dungpcaudio9999/evolve_web.git
cd evolve_web
```
Tải repo về máy và đi vào thư mục repo.

```bash
git fetch origin
git branch -r
```
`fetch` tải mọi branch trên GitHub về, `branch -r` liệt kê chúng. Phải thấy 3 branch của tuần 1:
`origin/feature/W1-A2-monorepo`, `origin/feature/W1-A3-docker-postgres`, `origin/feature/W1-A4-shared-contract`.

> Khi các PR #14, #15, #16 đã merge vào `dev`, chỉ cần `git checkout dev` rồi làm các bước 3–5 trên `dev`.

### Bước 3. W1-A2: Monorepo

```bash
git checkout feature/W1-A2-monorepo
```
Chuyển sang branch của task W1-A2.

```bash
pnpm install
```
pnpm đọc `pnpm-workspace.yaml` (workspace gồm `apps/*` và `packages/*`) rồi cài dependency ở gốc (`prettier`, `typescript`) theo đúng phiên bản trong `pnpm-lock.yaml`.

```bash
pnpm format:check
```
Prettier kiểm tra mọi file có đúng quy tắc trong `.prettierrc` không. Lệnh chỉ kiểm tra, không sửa file.

**Kết quả mong đợi:**
- `pnpm install` kết thúc bằng `Done in …`.
- `format:check` in `All matched files use Prettier code style!`.

Như vậy đạt tiêu chí của W1-A2: `pnpm install` chạy được ở thư mục gốc.

### Bước 4. W1-A3: PostgreSQL bằng Docker

```bash
git checkout feature/W1-A3-docker-postgres
```
Chuyển sang branch W1-A3. Branch này xếp chồng trên W1-A2 nên có cả code của A2.

```bash
cp .env.example .env
```
**Không bắt buộc.** Tạo file `.env` ở gốc để đổi user, mật khẩu hoặc cổng của Postgres. Không có file này thì docker-compose dùng mặc định `evolve` / `evolve` / `evolve` / `5432`. Không bao giờ commit file `.env`; `.gitignore` đã chặn sẵn.

```bash
docker compose up -d
```
Đọc `docker-compose.yml`, tải image `postgres:16-alpine` (chỉ lần đầu) rồi chạy container `evolve-postgres` ở chế độ nền (`-d`). Dữ liệu lưu trong volume `postgres-data`, nên vẫn còn sau khi tắt container.

```bash
docker compose ps
```
Xem trạng thái container. Healthcheck chạy `pg_isready` 5 giây một lần. Chờ đến khi cột STATUS hiện **`healthy`**.

```bash
docker exec -it evolve-postgres psql -U evolve -d evolve -c "select version();"
```
Mở `psql` bên trong container, đăng nhập bằng user `evolve` vào database `evolve`, rồi chạy câu SQL in phiên bản Postgres.

**Kết quả mong đợi:** container ở trạng thái `healthy`, `psql` in ra `PostgreSQL 16.x …`. Như vậy đạt tiêu chí của W1-A3.

> Đã chạy thử thành công ngày 23/10/2026 (PostgreSQL 16.15). Nếu dùng mạng có proxy (như FPT), phải cấu hình proxy cho Docker trước; xem [Lỗi thường gặp](#lỗi-thường-gặp).

```bash
docker compose down
```
Dừng và xoá container. Volume dữ liệu vẫn giữ lại.

### Bước 5. W1-A4: Contract `packages/shared`

```bash
git checkout feature/W1-A4-shared-contract
```
Chuyển sang branch W1-A4. Branch này xếp chồng trên W1-A2 và độc lập với A3, nên ở branch này **không có** `docker-compose.yml`.

```bash
pnpm install
```
Cài lại vì branch này thêm package mới `@evolve/shared`. pnpm tạo liên kết (symlink) `node_modules/@evolve/shared` trỏ tới `packages/shared` và cài `zod`.

```bash
pnpm --filter @evolve/shared build
```
`--filter` chỉ chạy lệnh trong một package. `build` chạy `tsc -p tsconfig.build.json`: dịch `src/` sang `packages/shared/dist/` (JavaScript CommonJS và file type `.d.ts`). App web và api sẽ import từ `dist/`.

```bash
pnpm typecheck
```
Chạy `tsc --noEmit` ở mọi package có script `typecheck`. Lệnh chỉ kiểm tra lỗi type, không sinh file.

```bash
pnpm test
```
Ở package shared, `test` build lại rồi chạy `node --test test/*.test.js`. Đây là test runner có sẵn trong Node, không cần cài Jest.

**Kết quả mong đợi:** 4 dòng `ok`, rồi `# pass 4`, `# fail 0`. Bốn test kiểm tra:
1. có đủ 5 trạng thái và 5 độ ưu tiên;
2. `createIssueSchema` tự điền mặc định `BACKLOG`, `NO_PRIORITY`, `labelIds: []` và cắt khoảng trắng ở tiêu đề;
3. schema từ chối tiêu đề rỗng và status sai;
4. `registerSchema` chuyển email về chữ thường và từ chối mật khẩu dưới 8 ký tự.

Kiểm tra web và api đều import được package (tiêu chí của W1-A4):

```bash
cd packages/shared
node --input-type=module -e "import { STATUSES, createIssueSchema } from '@evolve/shared'; console.log(STATUSES.length, typeof createIssueSchema.parse)"
```
Import theo kiểu **ESM** (`import … from`), giống cách Next.js (`apps/web`) import. Mong đợi: `5 function`.

```bash
node -e "console.log(Object.keys(require('./dist')).length)"
cd ../..
```
Import theo kiểu **CommonJS** (`require`), giống cách NestJS (`apps/api`) chạy. Mong đợi: `21`, là số thứ được export. `cd ../..` quay về thư mục gốc.

### Bước 6. Kiểm tra GitHub (W1-A1)

```bash
gh label list -R dungpcaudio9999/evolve_web
```
Liệt kê labels. Phải thấy `role:A/B/C`, `area:*`, `week:1…6`, `contract-change`, `blocked`.

```bash
gh issue list -R dungpcaudio9999/evolve_web --label week:1 --state all
```
Liệt kê 12 issue tuần 1 (#2–#13), cả issue đang mở lẫn đã đóng (`--state all`).

```bash
gh project item-list 1 --owner dungpcaudio9999
```
Liệt kê các mục trên project board cùng cột `Status`. Có thể xem trực tiếp tại https://github.com/users/dungpcaudio9999/projects/1.

```bash
gh api repos/dungpcaudio9999/evolve_web/branches/dev/protection -q .required_pull_request_reviews.required_approving_review_count
```
Đọc cấu hình bảo vệ branch `dev`. Mong đợi: `1` (cần 1 người approve). Thay `dev` bằng `main` để kiểm tra `main`.

### Bước 7. Dọn dẹp

```bash
git checkout main
docker compose down -v
```
Quay về `main`. `down -v` xoá cả container lẫn volume, tức là **xoá hết dữ liệu DB ở local**. Bỏ `-v` nếu muốn giữ dữ liệu.

---

## Phần 2: Làm lại từ đầu

### W1-A1: Thiết lập GitHub

**Bước 1. Đặt biến cho gọn lệnh**
```bash
R=dungpcaudio9999/evolve_web   # đổi thành repo của bạn
OWNER=dungpcaudio9999          # đổi thành user/org của bạn
```
Biến shell chỉ tồn tại trong cửa sổ terminal hiện tại. Mở terminal mới thì phải đặt lại.

**Bước 2. Tạo labels**
```bash
for l in "role:A|Tech Lead, UI & DevOps|5319e7" "role:B|Backend|0e8a16" "role:C|Frontend|1d76db" \
  "area:web|apps/web|c5def5" "area:api|apps/api|bfdadc" \
  "area:shared|packages/shared (contract)|fbca04" "area:devops|Monorepo, Docker, CI, deploy|d4c5f9" \
  "week:1|Tuần 1|ededed" "week:2|Tuần 2|ededed" "week:3|Tuần 3|ededed" \
  "week:4|Tuần 4|ededed" "week:5|Tuần 5|ededed" "week:6|Tuần 6|ededed" \
  "contract-change|Thay đổi packages/shared, cần cả nhóm review|b60205" \
  "blocked|Đang bị chặn bởi task khác|000000"; do
  IFS='|' read n d c <<<"$l"
  gh label create "$n" -d "$d" -c "$c" -R $R --force
done
```
Vòng lặp tách từng chuỗi `tên|mô tả|màu` theo dấu `|`, rồi tạo label. `--force` cập nhật label nếu nó đã tồn tại, nên chạy lại nhiều lần cũng không lỗi.

**Bước 3. Tạo project board**
```bash
gh project create --owner $OWNER --title "Evolve Web" --format json
```
Tạo GitHub Project (bản mới, v2). Ghi lại `number` (ví dụ `1`) và `id` (dạng `PVT_…`) trong kết quả in ra.

```bash
gh project link <number> --owner $OWNER --repo $R
```
Liên kết board với repo, để board hiện ở tab Projects của repo.

```bash
gh project field-list <number> --owner $OWNER
```
Liệt kê các trường của board. Ghi lại ID của trường **Status** (dạng `PVTSSF_…`).

**Bước 4. Đặt 4 cột Todo / In Progress / Review / Done**
```bash
gh api graphql -f f=<STATUS_FIELD_ID> -f query='mutation($f:ID!){updateProjectV2Field(input:{fieldId:$f,
  singleSelectOptions:[{name:"Todo",color:GRAY,description:""},{name:"In Progress",color:YELLOW,description:""},
  {name:"Review",color:BLUE,description:""},{name:"Done",color:GREEN,description:""}]}){projectV2Field{
  ... on ProjectV2SingleSelectField{options{id name}}}}}'
```
`gh` chưa có lệnh sửa các lựa chọn của một trường, nên dùng thẳng GraphQL API. Mặc định có 3 cột (Todo / In Progress / Done); lệnh này thay bằng 4 cột. Ghi lại `id` của từng cột trong kết quả để dùng ở bước 6.

**Bước 5. Tạo issue tuần 1 và đưa lên board**
```bash
mk(){ # mã, người, area, tiêu đề, tiêu chí xong, phụ thuộc
  url=$(gh issue create -R $R -t "[$1] $4" \
        -b "Task trong docs/TIMELINE.md (Tuần 1).

**Tiêu chí xong:** $5
**Phụ thuộc:** $6" \
        -l "role:$2,week:1,area:$3")
  echo "$1 $url"
  gh project item-add <number> --owner $OWNER --url $url
}
mk W1-A1 A devops "Tạo repo GitHub, GitHub Projects, nhãn, template PR" "Board có cột Todo / In Progress / Review / Done" "–"
mk W1-A2 A devops "Dựng monorepo: pnpm-workspace, package.json gốc, script dev/build/lint" "pnpm install chạy được ở thư mục gốc" "W1-A1"
mk W1-A3 A devops "docker-compose.yml (PostgreSQL), .env.example" "docker compose up chạy được Postgres" "W1-A2"
mk W1-A4 A shared "Contract packages/shared: type, hằng số, zod schema" "Import được từ cả web lẫn api" "W1-A2"
mk W1-B1 B api "Học NestJS (module, controller, service, DTO) và Prisma" "Làm xong một CRUD mẫu ở máy cá nhân" "–"
mk W1-B2 B api "Khởi tạo apps/api (NestJS) trong monorepo, GET /health" "GET /health trả về 200" "W1-A2"
mk W1-B3 B shared "Review contract, góp ý các trường cần lưu trong DB" "Đã comment trên PR contract" "W1-A4"
mk W1-C1 C web "Khởi tạo apps/web: Next.js 15, TypeScript, Tailwind v4, ESLint, Prettier" "pnpm dev chạy được web" "W1-A2"
mk W1-C2 C web "Cài shadcn/ui và các component trong components/ui/" "Trang /dev/ui hiển thị đủ component" "W1-C1"
mk W1-C3 C web "components/common: status-icon, priority-icon, user-avatar" "Hiển thị đúng 5 trạng thái và 5 độ ưu tiên" "W1-A4"
mk W1-C4 C shared "Review contract theo góc nhìn giao diện" "Đã comment trên PR contract" "W1-A4"
mk W1-ALL A devops "Họp kickoff: thống nhất quy tắc, chốt contract" "Đã merge PR contract" "–"
```
Hàm `mk` tạo một issue có tiêu đề dạng `[W1-xx] …`, nội dung ghi tiêu chí xong và phụ thuộc, gắn 3 label, rồi đưa issue lên board.

> Nếu gặp lỗi `temporary conflict` khi `item-add` (do gọi API quá nhanh), chạy lại riêng lệnh `gh project item-add` cho issue đó.

**Bước 6. Chuyển issue sang đúng cột**
```bash
gh project item-list <number> --owner $OWNER --format json   # lấy id của từng mục (dạng PVTI_…)
gh project item-edit --id <ITEM_ID> --project-id <PROJECT_ID> \
  --field-id <STATUS_FIELD_ID> --single-select-option-id <OPTION_ID>
```
Mục mới thêm chưa nằm ở cột nào. `item-edit` đặt cột cho từng mục, dùng `id` của các cột lấy ở bước 4.

```bash
gh issue close <số issue W1-A1> -R $R -c "Đã tạo labels, Project board và issue tuần 1."
```
Đóng issue W1-A1 kèm một bình luận giải thích.

**Bước 7. Bảo vệ branch `main` và `dev`**
```bash
for b in main dev; do
  echo '{"required_status_checks":null,"enforce_admins":false,
         "required_pull_request_reviews":{"required_approving_review_count":1},
         "restrictions":null,"allow_force_pushes":false,"allow_deletions":false}' |
  gh api -X PUT repos/$R/branches/$b/protection --input -
done
```
Gửi cấu hình bảo vệ cho từng branch:

| Trường | Ý nghĩa |
|---|---|
| `required_pull_request_reviews.required_approving_review_count: 1` | Phải qua PR và có 1 người approve mới merge được |
| `required_status_checks: null` | Chưa bắt CI xanh; sẽ thêm ở W2-A1 khi đã có CI |
| `enforce_admins: false` | Admin (A) vẫn vượt được khi khẩn cấp |
| `allow_force_pushes`, `allow_deletions: false` | Cấm force-push và xoá branch |

> Repo private trên gói miễn phí không bật được bảo vệ branch (lỗi 403). Repo public thì được.

### W1-A2: Monorepo

```bash
git fetch origin
git checkout -b feature/W1-A2-monorepo origin/dev
```
Tạo branch task từ `dev` mới nhất trên GitHub, theo quy trình trong [EVOLVE_WEB_TEAM_WORKFLOW.vi.md](../EVOLVE_WEB_TEAM_WORKFLOW.vi.md).

Tạo các file sau ở thư mục gốc. Nội dung lấy từ branch mẫu bằng `git show origin/feature/W1-A2-monorepo:<file>`.

| File | Vai trò |
|---|---|
| `pnpm-workspace.yaml` | Khai báo workspace gồm `apps/*`, `packages/*` |
| `package.json` | Ghim pnpm, yêu cầu Node; các script `dev`, `build`, `lint`, `typecheck`, `test`, `format` |
| `tsconfig.base.json` | Cấu hình TypeScript chung để các package `extends` |
| `.prettierrc`, `.prettierignore` | Quy tắc format và các file bỏ qua |
| `.editorconfig`, `.nvmrc` | Quy tắc editor (LF, 2 dấu cách); phiên bản Node |
| `.gitignore` | Không commit `node_modules`, `dist`, `.next`, `.env` |

Ví dụ lấy nhanh tất cả file từ branch mẫu:
```bash
for f in pnpm-workspace.yaml package.json tsconfig.base.json .prettierrc .prettierignore .editorconfig .nvmrc .gitignore; do
  git show origin/feature/W1-A2-monorepo:$f > $f
done
```

```bash
pnpm install
```
Cài dependency và **sinh `pnpm-lock.yaml`**. File này ghi chính xác phiên bản đã cài và phải được commit.

```bash
pnpm format:check
git add -A
git commit -m "chore(repo): set up pnpm monorepo"
```
Kiểm tra format, đưa mọi thay đổi vào commit với message theo Conventional Commits. Trước `git add -A`, nên chạy `git status` để chắc không có file lạ.

### W1-A3: Docker PostgreSQL

```bash
git checkout -b feature/W1-A3-docker-postgres
```
Tạo branch mới **từ branch A2 đang đứng**, vì A3 cần nền monorepo của A2.

```bash
git show origin/feature/W1-A3-docker-postgres:docker-compose.yml > docker-compose.yml
git show origin/feature/W1-A3-docker-postgres:.env.example > .env.example
```
Tạo `docker-compose.yml` (service Postgres 16, volume, healthcheck) và `.env.example` (biến của docker, api, web).

```bash
docker compose config
```
Kiểm tra cú pháp `docker-compose.yml` và in cấu hình sau khi đã thay biến. Có lỗi thì lệnh báo ngay.

```bash
git add -A
git commit -m "chore(devops): add docker-compose for PostgreSQL and .env.example"
```

### W1-A4: Contract `packages/shared`

```bash
git checkout -b feature/W1-A4-shared-contract feature/W1-A2-monorepo
```
Tạo branch **từ A2** (không phải từ A3), để PR contract chỉ chứa thay đổi của shared.

```bash
git checkout origin/feature/W1-A4-shared-contract -- packages/shared
```
Lấy toàn bộ thư mục `packages/shared` từ branch mẫu về branch hiện tại. Cấu trúc thư mục:

```text
packages/shared/
├── package.json            # tên @evolve/shared, main/types trỏ vào dist/, dependency zod v3
├── tsconfig.json           # extends tsconfig.base.json, module CommonJS, src/ → dist/
├── tsconfig.build.json     # thêm declarationMap khi build
├── src/
│   ├── index.ts            # export tất cả
│   ├── constants/          # STATUSES, PRIORITIES, ISSUE_IDENTIFIER_PREFIX
│   ├── types/              # User, AuthResponse, Project, Label, Issue
│   └── schemas/            # zod: auth, project, issue, common
└── test/contract.test.js   # 4 test chạy bằng node --test
```

```bash
pnpm install
```
Đăng ký package mới trong workspace và cài `zod`.

```bash
pnpm test
pnpm typecheck
```
Build và chạy test (mong đợi `# pass 4`), rồi kiểm tra type.

```bash
pnpm format
```
Prettier **sửa** format trực tiếp trên file. Chạy trước khi commit để `format:check` không báo lỗi.

```bash
git add -A
git commit -m "feat(shared): add contract types, constants and zod schemas"
```

### Đẩy branch và tạo PR

```bash
git push -u origin feature/W1-A2-monorepo feature/W1-A3-docker-postgres feature/W1-A4-shared-contract
```
Đẩy cả 3 branch lên GitHub. `-u` ghi nhớ branch remote tương ứng, nên lần sau chỉ cần `git push`.

```bash
gh pr create -B dev -H feature/W1-A2-monorepo \
  -t "[W1-A2] Dựng monorepo pnpm" -b "Closes #3" -l "role:A,week:1,area:devops"
gh pr create -B feature/W1-A2-monorepo -H feature/W1-A3-docker-postgres \
  -t "[W1-A3] docker-compose PostgreSQL và .env.example" -b "Closes #4" -l "role:A,week:1,area:devops"
gh pr create -B feature/W1-A2-monorepo -H feature/W1-A4-shared-contract \
  -t "[W1-A4] Contract packages/shared (cần B, C review)" -b "Closes #5" \
  -l "role:A,week:1,area:shared,contract-change"
```
`-B` là branch đích (base), `-H` là branch nguồn (head). PR của A2 vào thẳng `dev`. PR của A3, A4 lấy base là branch A2 (**PR xếp chồng**), nên reviewer chỉ thấy phần thay đổi riêng của từng task. Nội dung PR nên điền đủ theo `.github/pull_request_template.md`.

### Merge theo thứ tự

1. B hoặc C approve **#14 (A2)**. Chọn **Squash and merge** rồi **Delete branch**. GitHub tự chuyển base của #15, #16 về `dev`.
2. Vì squash tạo commit mới, có thể phải rebase hai branch còn lại. **Chỉ làm sau khi #14 đã merge** (`gh pr view 14 --json state -q .state` in `MERGED`). Làm trước thì `dev` chưa có code A2, nên rebase sẽ conflict ở README.md; khi đó chạy `git rebase --abort` để quay lại.
   ```bash
   git fetch origin
   git checkout feature/W1-A3-docker-postgres
   git rebase --onto origin/dev feature/W1-A2-monorepo
   git push --force-with-lease
   ```
   `rebase --onto` chuyển các commit riêng của A3 (sau A2) lên đầu `dev` mới. `--force-with-lease` chỉ ghi đè branch **của chính mình**, và từ chối nếu có ai khác đã push lên branch đó. Làm tương tự với `feature/W1-A4-shared-contract`.
3. Merge #15. Merge #16 sau khi B và C đã review và cả nhóm chốt contract ở buổi kickoff.
4. Đóng issue bằng tay, vì "Closes #" chỉ tự đóng khi merge vào branch mặc định (`main`):
   ```bash
   gh issue close 3 -R $R
   gh issue close 4 -R $R
   gh issue close 5 -R $R
   ```

---

## Lỗi thường gặp

| Lỗi | Nguyên nhân | Cách xử lý |
|---|---|---|
| `pnpm: command not found` | Chưa bật corepack | `corepack enable`, hoặc dùng `npx pnpm@10.12.1` |
| `corepack enable` báo `EACCES: permission denied, symlink … '/usr/bin/pnpm'` | Node cài qua apt, corepack không ghi được vào `/usr/bin` | `mkdir -p ~/.local/bin && corepack enable --install-directory ~/.local/bin pnpm`, đảm bảo `~/.local/bin` có trong `PATH`; hoặc dùng `npx pnpm@10.12.1` |
| `docker: command not found` | Chưa cài Docker | `sudo apt install docker.io docker-compose-v2`, rồi `sudo usermod -aG docker $USER` và đăng nhập lại |
| `Cannot find module '@evolve/shared'` | Chưa `pnpm install` sau khi đổi branch, hoặc chưa build `dist/` | `pnpm install && pnpm --filter @evolve/shared build` |
| `docker run`/`pull` báo `dial tcp …:443: i/o timeout` | Mạng bắt đi qua proxy (ví dụ `proxy.fpt.vn:80`); terminal có biến `HTTPS_PROXY` nhưng Docker daemon không đọc | Kiểm tra bằng `env \| grep -i _proxy`. Tạo `/etc/systemd/system/docker.service.d/proxy.conf` chứa `[Service]` và các dòng `Environment="HTTP_PROXY=…"`, `Environment="HTTPS_PROXY=…"`, `Environment="NO_PROXY=localhost,127.0.0.1,::1"`, rồi `sudo systemctl daemon-reload && sudo systemctl restart docker` |
| `port 5432 is already allocated` | Máy đã chạy sẵn một Postgres khác | Đặt `POSTGRES_PORT=5433` trong `.env` rồi `docker compose up -d` lại |
| `format:check` báo file sai format | Chưa chạy Prettier | `pnpm format` rồi commit lại |
| `temporary conflict` khi thêm vào board | Gọi API GitHub quá nhanh | Chạy lại lệnh `gh project item-add` |
| 403 khi bật bảo vệ branch | Repo private trên gói miễn phí | Chuyển repo sang public hoặc nâng gói |
