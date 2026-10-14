# apps/

> Người phụ trách: **A**

## Mục đích
Chứa các **ứng dụng chạy được** của dự án. Mỗi thư mục con là một app độc lập, có `package.json` riêng, được quản lý chung bằng pnpm workspaces.

## Cấu trúc
| Thư mục | Vai trò | Người phụ trách | Cổng local | Khởi tạo ở task |
|---|---|---|---|---|
| `web/` | Frontend: giao diện người dùng (Next.js 15) | C (khởi tạo), A + C (phát triển) | `3000` | W1-C1 |
| `api/` | Backend: REST API, xác thực, truy cập database (NestJS) | B | `4000` | W1-B2 |

> Hai thư mục `web/` và `api/` **chưa được tạo**: chúng sẽ được sinh bằng `create-next-app` và `nest new`. Sau khi khởi tạo, người phụ trách thay README do công cụ sinh ra bằng khung trong [`docs/readme-templates/`](../docs/readme-templates/).

## Cách hai app giao tiếp
```text
Trình duyệt ──► web (Next.js) ──HTTP/JSON + JWT──► api (NestJS) ──Prisma──► PostgreSQL
```
<!-- TODO(A): bổ sung chi tiết: header Authorization, CORS, NEXT_PUBLIC_API_URL -->

## Quy ước
- App không import code trực tiếp từ app khác; code dùng chung đặt trong [`packages/`](../packages/README.md).
- Lệnh chạy riêng từng app: `pnpm --filter web <lệnh>`, `pnpm --filter api <lệnh>`.
<!-- TODO(A): bổ sung quy ước khác nếu có -->

## Liên quan
- Task: W1-A2, W1-C1, W1-B2 trong [TIMELINE.md](../docs/TIMELINE.md)
