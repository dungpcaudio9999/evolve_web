/**
 * Dữ liệu mẫu, **chỉ dùng cho trang /dev/ui và test** (từ W4-C1 app lấy dữ liệu thật qua API).
 * Khớp với seed của apps/api (prisma/seed.ts) nhưng chỉ lấy project EVO.
 * Thời gian cố định để server và trình duyệt render giống nhau (tránh lỗi hydration).
 */
import type { Issue, Label, Priority, Project, Status, User } from '@evolve/shared';

export const SAMPLE_USERS: User[] = [
  {
    id: 'u-an',
    name: 'Nguyễn Văn An',
    email: 'an@evolve.dev',
    avatarUrl: null,
    createdAt: '2026-11-01T08:00:00.000Z',
  },
  {
    id: 'u-binh',
    name: 'Trần Thị Bình',
    email: 'binh@evolve.dev',
    avatarUrl: null,
    createdAt: '2026-11-01T08:00:00.000Z',
  },
  {
    id: 'u-chi',
    name: 'Lê Minh Chi',
    email: 'chi@evolve.dev',
    avatarUrl: null,
    createdAt: '2026-11-01T08:00:00.000Z',
  },
];

export const SAMPLE_LABELS: Label[] = [
  { id: 'l-bug', name: 'Bug', color: '#E5484D' },
  { id: 'l-feature', name: 'Feature', color: '#E8B07C' },
  { id: 'l-improvement', name: 'Improvement', color: '#D5EFF4' },
  { id: 'l-design', name: 'Design', color: '#F2E3BC' },
  { id: 'l-docs', name: 'Docs', color: '#3E6C76' },
];

export const SAMPLE_PROJECTS: Project[] = [
  {
    id: 'p-evo',
    name: 'Evolve Web',
    key: 'EVO',
    icon: '🚀',
    color: '#E8B07C',
    ownerId: 'u-an',
    createdAt: '2026-11-01T08:00:00.000Z',
    updatedAt: '2026-11-01T08:00:00.000Z',
  },
];

type Row = [
  title: string,
  status: Status,
  priority: Priority,
  assignee: string | null,
  labels: string[],
];

const ROWS: Row[] = [
  ['Thiết kế trang đăng nhập', 'DONE', 'HIGH', 'u-an', ['l-design']],
  ['API đăng ký và đăng nhập (JWT)', 'IN_PROGRESS', 'URGENT', 'u-binh', ['l-feature']],
  ['Danh sách issue nhóm theo trạng thái', 'IN_PROGRESS', 'HIGH', 'u-chi', ['l-feature']],
  ['Board kéo thả issue giữa các cột', 'TODO', 'HIGH', 'u-chi', ['l-feature']],
  ['Modal tạo issue (phím tắt C)', 'TODO', 'MEDIUM', 'u-chi', ['l-feature']],
  ['Lọc issue theo trạng thái, độ ưu tiên', 'TODO', 'MEDIUM', null, ['l-feature']],
  ['Tìm kiếm issue bằng Ctrl+K', 'BACKLOG', 'LOW', null, ['l-feature']],
  ['Sidebar không thu gọn được trên mobile', 'TODO', 'URGENT', 'u-an', ['l-bug']],
  ['Font tiêu đề hiển thị sai trên Safari', 'BACKLOG', 'MEDIUM', null, ['l-bug', 'l-design']],
  ['Viết tài liệu API trên Swagger', 'BACKLOG', 'LOW', 'u-binh', ['l-docs']],
  ['Tối ưu truy vấn danh sách issue', 'BACKLOG', 'NO_PRIORITY', null, ['l-improvement']],
  ['Cấu hình CI GitHub Actions', 'DONE', 'MEDIUM', 'u-an', ['l-improvement']],
  ['Bảng màu và font theo taalas', 'DONE', 'HIGH', 'u-an', ['l-design']],
  ['Trang chi tiết issue', 'BACKLOG', 'MEDIUM', 'u-chi', ['l-feature']],
  ['Hỗ trợ đa ngôn ngữ', 'CANCELED', 'LOW', null, ['l-feature']],
];

/** Rank trong từng cột: 0|i, 0|j, 0|k… (giống seed backend). */
const RANK_CHARS = 'ijklmnopqrstuvwxyz';

export const SAMPLE_ISSUES: Issue[] = (() => {
  const countByStatus = new Map<Status, number>();
  return ROWS.map(([title, status, priority, assigneeId, labelIds], i) => {
    const n = countByStatus.get(status) ?? 0;
    countByStatus.set(status, n + 1);
    const time = new Date(Date.UTC(2026, 10, 2, 8, i)).toISOString();
    return {
      id: `i-evo-${i + 1}`,
      identifier: `EVO-${i + 1}`,
      title,
      description: null,
      status,
      priority,
      rank: `0|${RANK_CHARS[n]}`,
      projectId: 'p-evo',
      assigneeId,
      labels: SAMPLE_LABELS.filter((l) => labelIds.includes(l.id)),
      createdAt: time,
      updatedAt: time,
    };
  });
})();
