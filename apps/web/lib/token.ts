/**
 * Lưu JWT trong localStorage. Mọi hàm an toàn khi chạy trên server (không có window)
 * và khi trình duyệt chặn localStorage (chế độ riêng tư).
 */
const TOKEN_KEY = 'evolve.accessToken';

export function getToken(): string | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string): void {
  try {
    window.localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // Không lưu được thì phiên chỉ tồn tại tới khi tải lại trang.
  }
}

export function clearToken(): void {
  try {
    window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    // bỏ qua
  }
}
