/**
 * Dữ liệu mẫu cho môi trường phát triển: 3 users, 2 projects, 30 issues, 5 labels.
 * Chạy: pnpm --filter api db:seed  (XÓA dữ liệu cũ rồi nạp lại).
 * Tài khoản đăng nhập: an@evolve.dev / binh@evolve.dev / chi@evolve.dev, mật khẩu: password123
 * Project EVO thuộc An, MOB thuộc Bình (chỉ chủ mới thấy project); Chi chưa có project.
 */
import LexoRank from '@kayron013/lexorank';
import { PrismaClient, type Priority, type Status } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

const SEED_PASSWORD = 'password123';

const USERS = [
  { key: 'an', name: 'Nguyễn Văn An', email: 'an@evolve.dev' },
  { key: 'binh', name: 'Trần Thị Bình', email: 'binh@evolve.dev' },
  { key: 'chi', name: 'Lê Minh Chi', email: 'chi@evolve.dev' },
] as const;

const LABELS = [
  { key: 'bug', name: 'Bug', color: '#E5484D' },
  { key: 'feature', name: 'Feature', color: '#E8B07C' },
  { key: 'improvement', name: 'Improvement', color: '#D5EFF4' },
  { key: 'design', name: 'Design', color: '#F2E3BC' },
  { key: 'docs', name: 'Docs', color: '#3E6C76' },
] as const;

type UserKey = (typeof USERS)[number]['key'];
type LabelKey = (typeof LABELS)[number]['key'];

interface SeedIssue {
  title: string;
  status: Status;
  priority: Priority;
  assignee?: UserKey;
  labels?: LabelKey[];
  description?: string;
}

const PROJECTS: {
  key: string;
  name: string;
  icon: string;
  color: string;
  /** Chủ project: chỉ chủ mới thấy project (W3-B2). */
  owner: UserKey;
  issues: SeedIssue[];
}[] = [
  {
    key: 'EVO',
    owner: 'an',
    name: 'Evolve Web',
    icon: '🚀',
    color: '#E8B07C',
    issues: [
      {
        title: 'Thiết kế trang đăng nhập',
        status: 'DONE',
        priority: 'HIGH',
        assignee: 'an',
        labels: ['design'],
      },
      {
        title: 'API đăng ký và đăng nhập (JWT)',
        status: 'IN_PROGRESS',
        priority: 'URGENT',
        assignee: 'binh',
        labels: ['feature'],
      },
      {
        title: 'Danh sách issue nhóm theo trạng thái',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        assignee: 'chi',
        labels: ['feature'],
      },
      {
        title: 'Board kéo thả issue giữa các cột',
        status: 'TODO',
        priority: 'HIGH',
        assignee: 'chi',
        labels: ['feature'],
      },
      {
        title: 'Modal tạo issue (phím tắt C)',
        status: 'TODO',
        priority: 'MEDIUM',
        assignee: 'chi',
        labels: ['feature'],
      },
      {
        title: 'Lọc issue theo trạng thái, độ ưu tiên',
        status: 'TODO',
        priority: 'MEDIUM',
        labels: ['feature'],
      },
      {
        title: 'Tìm kiếm issue bằng Ctrl+K',
        status: 'BACKLOG',
        priority: 'LOW',
        labels: ['feature'],
      },
      {
        title: 'Sidebar không thu gọn được trên mobile',
        status: 'TODO',
        priority: 'URGENT',
        assignee: 'an',
        labels: ['bug'],
      },
      {
        title: 'Font tiêu đề hiển thị sai trên Safari',
        status: 'BACKLOG',
        priority: 'MEDIUM',
        labels: ['bug', 'design'],
      },
      {
        title: 'Viết tài liệu API trên Swagger',
        status: 'BACKLOG',
        priority: 'LOW',
        assignee: 'binh',
        labels: ['docs'],
      },
      {
        title: 'Tối ưu truy vấn danh sách issue',
        status: 'BACKLOG',
        priority: 'NO_PRIORITY',
        labels: ['improvement'],
      },
      {
        title: 'Cấu hình CI GitHub Actions',
        status: 'DONE',
        priority: 'MEDIUM',
        assignee: 'an',
        labels: ['improvement'],
      },
      {
        title: 'Bảng màu và font theo taalas',
        status: 'DONE',
        priority: 'HIGH',
        assignee: 'an',
        labels: ['design'],
      },
      {
        title: 'Trang chi tiết issue',
        status: 'BACKLOG',
        priority: 'MEDIUM',
        assignee: 'chi',
        labels: ['feature'],
      },
      { title: 'Hỗ trợ đa ngôn ngữ', status: 'CANCELED', priority: 'LOW', labels: ['feature'] },
    ],
  },
  {
    key: 'MOB',
    owner: 'binh',
    name: 'Mobile App',
    icon: '📱',
    color: '#D5EFF4',
    issues: [
      {
        title: 'Khảo sát người dùng mobile',
        status: 'DONE',
        priority: 'MEDIUM',
        assignee: 'an',
        labels: ['docs'],
      },
      {
        title: 'Wireframe màn hình danh sách issue',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        assignee: 'chi',
        labels: ['design'],
      },
      {
        title: 'Đăng nhập bằng vân tay',
        status: 'BACKLOG',
        priority: 'LOW',
        labels: ['feature'],
      },
      {
        title: 'Thông báo đẩy khi được giao issue',
        status: 'TODO',
        priority: 'MEDIUM',
        assignee: 'binh',
        labels: ['feature'],
      },
      {
        title: 'Ứng dụng crash khi mất mạng',
        status: 'IN_PROGRESS',
        priority: 'URGENT',
        assignee: 'binh',
        labels: ['bug'],
      },
      {
        title: 'Chế độ tối (dark mode)',
        status: 'TODO',
        priority: 'LOW',
        labels: ['design', 'improvement'],
      },
      {
        title: 'Đồng bộ dữ liệu ngoại tuyến',
        status: 'BACKLOG',
        priority: 'HIGH',
        labels: ['feature'],
      },
      {
        title: 'Giảm dung lượng ứng dụng',
        status: 'BACKLOG',
        priority: 'NO_PRIORITY',
        labels: ['improvement'],
      },
      {
        title: 'Màn hình chào mừng',
        status: 'DONE',
        priority: 'LOW',
        assignee: 'chi',
        labels: ['design'],
      },
      {
        title: 'Hướng dẫn cài đặt cho tester',
        status: 'TODO',
        priority: 'NO_PRIORITY',
        assignee: 'an',
        labels: ['docs'],
      },
      {
        title: 'Nút quay lại không hoạt động trên Android',
        status: 'TODO',
        priority: 'HIGH',
        assignee: 'binh',
        labels: ['bug'],
      },
      {
        title: 'Kéo để làm mới danh sách',
        status: 'BACKLOG',
        priority: 'MEDIUM',
        labels: ['improvement'],
      },
      { title: 'Hỗ trợ máy tính bảng', status: 'CANCELED', priority: 'LOW', labels: ['feature'] },
      {
        title: 'Cập nhật icon ứng dụng',
        status: 'DONE',
        priority: 'LOW',
        assignee: 'chi',
        labels: ['design'],
      },
      {
        title: 'Ghi log lỗi lên server',
        status: 'BACKLOG',
        priority: 'MEDIUM',
        assignee: 'binh',
        labels: ['improvement'],
      },
    ],
  },
];

async function main() {
  // Xóa theo thứ tự phụ thuộc để chạy lại seed nhiều lần được.
  await prisma.issueLabel.deleteMany();
  await prisma.issue.deleteMany();
  await prisma.label.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await hash(SEED_PASSWORD, 10);
  const userIds = {} as Record<UserKey, string>;
  for (const u of USERS) {
    const user = await prisma.user.create({ data: { name: u.name, email: u.email, passwordHash } });
    userIds[u.key] = user.id;
  }

  const labelIds = {} as Record<LabelKey, string>;
  for (const l of LABELS) {
    const label = await prisma.label.create({ data: { name: l.name, color: l.color } });
    labelIds[l.key] = label.id;
  }

  for (const p of PROJECTS) {
    const project = await prisma.project.create({
      data: { key: p.key, name: p.name, icon: p.icon, color: p.color, ownerId: userIds[p.owner] },
    });

    // Rank tăng dần trong từng cột trạng thái, bắt đầu từ giữa dải để còn chỗ chèn hai đầu.
    const lastRank = new Map<Status, LexoRank>();
    let number = 0;
    for (const issue of p.issues) {
      number += 1;
      const prev = lastRank.get(issue.status);
      const rank = prev ? LexoRank.between(prev, null) : new LexoRank('i');
      lastRank.set(issue.status, rank);

      await prisma.issue.create({
        data: {
          number,
          identifier: `${p.key}-${number}`,
          title: issue.title,
          description: issue.description ?? null,
          status: issue.status,
          priority: issue.priority,
          rank: rank.toString(),
          projectId: project.id,
          assigneeId: issue.assignee ? userIds[issue.assignee] : null,
          labels: { create: (issue.labels ?? []).map((k) => ({ labelId: labelIds[k] })) },
        },
      });
    }
    await prisma.project.update({ where: { id: project.id }, data: { issueCounter: number } });
  }

  const [users, projects, issues, labels] = await Promise.all([
    prisma.user.count(),
    prisma.project.count(),
    prisma.issue.count(),
    prisma.label.count(),
  ]);
  console.log(
    `Seed xong: ${users} users, ${projects} projects, ${issues} issues, ${labels} labels`,
  );
  console.log(`Đăng nhập: ${USERS.map((u) => u.email).join(', ')} / ${SEED_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
