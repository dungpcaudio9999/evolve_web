/** Người dùng trả về từ API. Không bao giờ chứa passwordHash. */
export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  /** ISO 8601 */
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}
