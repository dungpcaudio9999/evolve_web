import type { Priority, Status } from '../constants';
import type { Label } from './label';

export interface Issue {
  id: string;
  /** Mã hiển thị do API sinh, ví dụ `EVO-12` */
  identifier: string;
  title: string;
  /** Markdown; null = chưa có mô tả */
  description: string | null;
  status: Status;
  priority: Priority;
  /** Chuỗi lexorank, sắp thứ tự trong cùng một status (tăng dần) */
  rank: string;
  projectId: string;
  assigneeId: string | null;
  labels: Label[];
  /** ISO 8601 */
  createdAt: string;
  /** ISO 8601 */
  updatedAt: string;
}
