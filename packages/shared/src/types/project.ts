export interface Project {
  id: string;
  name: string;
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
