# apps/mobile: Evolve cho điện thoại (React Native + Expo)

Gọi cùng REST API với `apps/web` và dùng chung `packages/shared` (type, zod schema, STATUSES/PRIORITIES).
Tài liệu môn học: React Native (MA1–MA3). Dùng **Expo** để chạy trên điện thoại qua app **Expo Go**, không cần Android Studio.

## Chạy

```bash
pnpm install                          # ở thư mục gốc; dependency đã khai báo trong package.json
pnpm --filter @evolve/shared build    # Metro đọc packages/shared/dist
cd apps/mobile
cp .env.example .env                  # sửa EXPO_PUBLIC_API_URL
pnpm start                            # quét QR bằng Expo Go
```

- Thêm gói React Native thì dùng `npx expo install <gói>` (chọn phiên bản hợp với Expo SDK), không dùng `pnpm add`.
- Điện thoại **không gọi được `localhost`** của laptop. Đặt `EXPO_PUBLIC_API_URL` là URL Render, hoặc IP LAN của máy chạy API (điện thoại và máy cùng Wi-Fi).
- Máy có `proxy` trong `~/.config/pnpm/rc` mà proxy đó chặn npm: chạy `XDG_CONFIG_HOME=$(mktemp -d) pnpm install` để bỏ qua cấu hình đó.
- Kiểm tra: `pnpm typecheck`, `npx expo-doctor`, `npx expo export --platform android` (bundle thử).

## Cấu trúc

```
app/                    Expo Router: routing theo thư mục, giống App Router của Next.js
  _layout.tsx           kiểm tra token, chọn (auth) hoặc (main) bằng Stack.Protected
  (auth)/login.tsx      đăng nhập (F7)
  (auth)/register.tsx   đăng ký (F7)
  (main)/index.tsx      issue nhóm theo trạng thái, kéo xuống để tải lại, nhấn giữ để đổi trạng thái (F1)
components/auth-form.tsx
lib/api-client.ts       fetch + JWT, giống apps/web/lib/api-client.ts (không có toast)
lib/token.ts            JWT lưu trong expo-secure-store thay cho localStorage
lib/theme.ts            màu taalas
store/                  Zustand: auth-store, issues-store
```

## Việc tiếp theo

Xem giai đoạn 8 trong [PLAN.md](../../PLAN.md) và tuần 7 trong [docs/TIMELINE.md](../../docs/TIMELINE.md).
