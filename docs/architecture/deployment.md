# Deploy: Neon + Render + Vercel

> Người phụ trách: **A** (web, Render), **B** (DB, migrate, seed) · Task: W5-A1, W5-A2, W5-B3
> Tất cả đều dùng gói **miễn phí**. Làm theo thứ tự 1 → 5, vì mỗi bước cần URL của bước trước.

```
Trình duyệt ──► Vercel (apps/web, Next.js) ──HTTPS/JSON──► Render (apps/api, NestJS) ──► Neon (PostgreSQL)
                NEXT_PUBLIC_API_URL                       CORS_ORIGIN, JWT_SECRET       DATABASE_URL
```

| Thành phần | Dịch vụ | Cấu hình trong repo | Deploy từ nhánh |
|---|---|---|---|
| Database | Neon Free | – | – |
| API | Render Free (Singapore) | [`render.yaml`](../../render.yaml) | `main` |
| Web | Vercel Hobby | [`apps/web/vercel.json`](../../apps/web/vercel.json) | `main` (production), mỗi PR có bản preview |

## 0. Chuẩn bị: đưa code lên `main`

Render và Vercel deploy từ `main`. Hiện `main` còn ở tuần 3 (#69), nên cần release `dev → main` trước:

```bash
gh pr create --base main --head dev --title "release: v0.5 (week 5)"
```

## 1. Neon: tạo database (W5-A1, B)

1. Đăng nhập https://console.neon.tech bằng GitHub → **New project**: tên `evolve`, Postgres 16, region **AWS Asia Pacific (Singapore)** (cùng vùng với Render).
2. **Connection Details** → **tắt "Connection pooling"** → copy chuỗi dạng
   `postgresql://<user>:<password>@ep-xxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require`.
   Dùng bản **không pooled**: `prisma migrate` không chạy được qua pooler.
3. Giữ chuỗi này bí mật: không dán vào issue, PR hay chat nhóm.

## 2. Migrate và seed lên Neon (W5-B3, B)

Chạy từ máy **có mạng** (A520M), trong bản clone đã `pnpm install`:

```bash
cd apps/api
export DATABASE_URL='postgresql://...neon.tech/neondb?sslmode=require'
pnpm exec prisma migrate deploy   # tạo bảng
pnpm db:seed                      # 3 tài khoản mẫu, mật khẩu password123 (XÓA dữ liệu cũ!)
unset DATABASE_URL
```

Render cũng tự chạy `prisma migrate deploy` mỗi lần khởi động, nên các migration sau này không phải chạy tay. **Chỉ seed một lần**, vì seed xóa sạch dữ liệu.

## 3. Render: deploy API (W5-A1, A)

1. Đăng nhập https://dashboard.render.com bằng GitHub, cho phép truy cập repo `evolve_web`.
2. **New → Blueprint** → chọn repo → Render đọc `render.yaml` và tạo service `evolve-api`.
3. Nhập 2 biến đánh dấu `sync: false`:
   - `DATABASE_URL`: chuỗi Neon ở bước 1.
   - `CORS_ORIGIN`: tạm để `http://localhost:3000`, sửa lại ở bước 5.
   `JWT_SECRET` do Render tự sinh; `NODE_VERSION=22` và `JWT_EXPIRES_IN=7d` đã có sẵn.
4. **Apply**. Lần build đầu mất khoảng 5 phút. Xong sẽ có URL dạng `https://evolve-api.onrender.com`. Nếu tên đã bị dùng, Render thêm hậu tố, ví dụ `evolve-api-x1y2`.
5. Kiểm tra: `curl https://evolve-api.onrender.com/health` → `{"status":"ok","db":"up",...}`. Swagger ở `/docs`.

## 4. Vercel: deploy web (W5-A2, A)

1. Đăng nhập https://vercel.com bằng GitHub → **Add New → Project** → import `evolve_web`.
2. **Root Directory: `apps/web`**. Framework tự nhận Next.js. Lệnh cài và build lấy từ `apps/web/vercel.json` (build `packages/shared` trước).
3. **Environment Variables:** `NEXT_PUBLIC_API_URL` = URL Render ở bước 3, không có `/` ở cuối.
   Biến này được gắn vào code lúc build, nên mỗi lần đổi giá trị phải **Redeploy**.
4. **Deploy** → có URL dạng `https://evolve-web.vercel.app`.

## 5. Nối hai bên: CORS (A)

Render → `evolve-api` → **Environment** → `CORS_ORIGIN` = URL Vercel ở bước 4 → **Save** (Render tự khởi động lại).
Muốn bản preview của PR cũng gọi được API thì thêm các URL đó, cách nhau bằng dấu phẩy.

**Kiểm tra cuối (tiêu chí của W5-A2):** mở URL Vercel → đăng nhập `an@evolve.dev` / `password123` → `/issues?view=board` → kéo một thẻ → tải lại trang, thẻ vẫn ở vị trí mới.

## Lỗi thường gặp

| Hiện tượng | Nguyên nhân | Cách xử lý |
|---|---|---|
| Lần đầu mở web, đăng nhập rất chậm (30–60 giây) | Render Free **ngủ sau 15 phút** không có truy cập | Trước khi demo, mở `/health` của API và chờ có kết quả |
| Đăng nhập báo lỗi mạng; console trình duyệt có `CORS` | `CORS_ORIGIN` sai: thừa `/` cuối, sai `https`, hoặc thiếu URL preview | Sửa `CORS_ORIGIN` cho khớp **chính xác** địa chỉ trên thanh địa chỉ |
| Web vẫn gọi `localhost:4000` | Thiếu `NEXT_PUBLIC_API_URL` lúc build | Đặt biến trên Vercel rồi **Redeploy** |
| Render build lỗi `pnpm: not found` | Thiếu `corepack enable` | Dùng đúng `buildCommand` trong `render.yaml` |
| `prisma migrate` treo hoặc lỗi trên Neon | Đang dùng chuỗi **pooled** (`-pooler` trong host) | Dùng chuỗi không pooled |
| `pnpm dev` báo lỗi 500 ở máy dùng proxy | Turbopack không đi qua proxy để tải Google Fonts | Chạy `pnpm exec next dev`. Không ảnh hưởng tới Vercel |

## Đã kiểm tra trước khi deploy (26/11)

Chạy trên máy A520M, đúng các lệnh trong `render.yaml` và `vercel.json`:

- Build API, rồi `prisma migrate deploy` trên **database trống** → `/health` trả `ok`.
- CORS trả `Access-Control-Allow-Origin: https://evolve-web.vercel.app` cho preflight.
- Đăng ký tài khoản được; seed vào DB mới rồi đăng nhập `an@evolve.dev` được.
- Build web với `NEXT_PUBLIC_API_URL=https://evolve-api.onrender.com`: 10 route; URL API có trong bundle, không còn `localhost:4000`.

Chưa kiểm tra (cần tài khoản): build thật trên Render và Vercel, kết nối tới Neon.
