import {
  STATUS_IDS,
  createIssueSchema,
  moveIssueSchema,
  updateIssueSchema,
  type CreateIssueInput,
  type Issue,
  type Label,
  type MoveIssueInput,
  type Project,
  type Status,
  type UpdateIssueInput,
  type User,
} from '@evolve/shared';
import { create } from 'zustand';
import { compareRank, rankBetween } from '@/lib/rank';
import { SAMPLE_ISSUES, SAMPLE_LABELS, SAMPLE_PROJECTS, SAMPLE_USERS } from '@/lib/sample-data';

/**
 * Store issue (W2-C1). Hiện dùng dữ liệu mẫu trong bộ nhớ; W4-C1 đổi phần thân các hàm sang gọi API
 * nhưng GIỮ NGUYÊN tên và tham số để component không phải sửa.
 * Input được validate bằng zod schema trong @evolve/shared (giống API).
 */
export interface IssuesState {
  issues: Issue[];
  /** Dữ liệu tham chiếu để hiển thị (assignee, label, key của project). */
  users: User[];
  labels: Label[];
  projects: Project[];

  /** Tạo issue, đặt cuối cột trạng thái. Ném ZodError nếu input sai. */
  addIssue: (input: CreateIssueInput) => Issue;
  /** Sửa các trường; đổi `status` thì issue chuyển xuống cuối cột mới. */
  updateIssue: (id: string, patch: UpdateIssueInput) => void;
  deleteIssue: (id: string) => void;
  /** Đổi trạng thái (dùng cho status-selector). */
  setStatus: (id: string, status: Status) => void;
  /** Kéo thả: chuyển sang `status`, đặt giữa `afterId` (phía trên) và `beforeId` (phía dưới). */
  moveIssue: (id: string, input: MoveIssueInput) => void;
}

let localId = 0;
const newId = () => `local-${Date.now().toString(36)}-${(localId++).toString(36)}`;

/** Rank để đặt issue xuống cuối cột `status` (bỏ qua chính nó). */
function rankAtEnd(issues: Issue[], status: Status, exceptId?: string): string {
  const column = issues.filter((i) => i.status === status && i.id !== exceptId).sort(compareRank);
  return rankBetween(column.at(-1)?.rank ?? null, null);
}

function nextIdentifier(issues: Issue[], project: Project): string {
  const prefix = `${project.key}-`;
  const max = issues
    .filter((i) => i.projectId === project.id && i.identifier.startsWith(prefix))
    .reduce((m, i) => Math.max(m, Number(i.identifier.slice(prefix.length)) || 0), 0);
  return `${prefix}${max + 1}`;
}

export const useIssuesStore = create<IssuesState>()((set, get) => ({
  issues: SAMPLE_ISSUES,
  users: SAMPLE_USERS,
  labels: SAMPLE_LABELS,
  projects: SAMPLE_PROJECTS,

  addIssue: (input) => {
    const data = createIssueSchema.parse(input);
    const { issues, projects, labels } = get();
    const project = projects.find((p) => p.id === data.projectId);
    if (!project) throw new Error(`Không tìm thấy project ${data.projectId}`);

    const now = new Date().toISOString();
    const issue: Issue = {
      id: newId(),
      identifier: nextIdentifier(issues, project),
      title: data.title,
      description: data.description ?? null,
      status: data.status,
      priority: data.priority,
      rank: rankAtEnd(issues, data.status),
      projectId: data.projectId,
      assigneeId: data.assigneeId ?? null,
      labels: labels.filter((l) => data.labelIds.includes(l.id)),
      createdAt: now,
      updatedAt: now,
    };
    set({ issues: [...issues, issue] });
    return issue;
  },

  updateIssue: (id, patch) => {
    const data = updateIssueSchema.parse(patch);
    set(({ issues, labels }) => ({
      issues: issues.map((issue) => {
        if (issue.id !== id) return issue;
        const { labelIds, ...fields } = data;
        const statusChanged = data.status !== undefined && data.status !== issue.status;
        return {
          ...issue,
          ...Object.fromEntries(Object.entries(fields).filter(([, v]) => v !== undefined)),
          ...(labelIds ? { labels: labels.filter((l) => labelIds.includes(l.id)) } : {}),
          ...(statusChanged ? { rank: rankAtEnd(issues, data.status!, id) } : {}),
          updatedAt: new Date().toISOString(),
        };
      }),
    }));
  },

  deleteIssue: (id) => set(({ issues }) => ({ issues: issues.filter((i) => i.id !== id) })),

  setStatus: (id, status) => get().updateIssue(id, { status }),

  moveIssue: (id, input) => {
    const { status, afterId, beforeId } = moveIssueSchema.parse(input);
    set(({ issues }) => {
      const rankOf = (otherId: string | null | undefined) =>
        (otherId && issues.find((i) => i.id === otherId)?.rank) || null;
      const after = rankOf(afterId);
      const before = rankOf(beforeId);
      const rank = after || before ? rankBetween(after, before) : rankAtEnd(issues, status, id);
      return {
        issues: issues.map((i) =>
          i.id === id ? { ...i, status, rank, updatedAt: new Date().toISOString() } : i,
        ),
      };
    });
  },
}));

/** Nhóm issue theo trạng thái, mỗi nhóm sắp theo rank. Luôn có đủ 5 key. */
export function groupByStatus(issues: Issue[]): Record<Status, Issue[]> {
  const groups = Object.fromEntries(STATUS_IDS.map((s) => [s, [] as Issue[]])) as Record<
    Status,
    Issue[]
  >;
  for (const issue of issues) groups[issue.status].push(issue);
  for (const s of STATUS_IDS) groups[s].sort(compareRank);
  return groups;
}
