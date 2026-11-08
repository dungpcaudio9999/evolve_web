export interface Project {
  id: string;
  name: string;
  /** Tiền tố của identifier issue, 2–5 ký tự viết hoa. Ví dụ "EVO" → "EVO-12". Không đổi sau khi tạo. */
  key: string;
  /** Emoji hoặc tên icon lucide; null = icon mặc định */
  icon: string | null;
  /** Màu hex, ví dụ `#E8B07C` */
  color: string;
  ownerId: string;
  /** ISO 8601 */
  createdAt: string;
  /** ISO 8601 */
  updatedAt: string;
}
