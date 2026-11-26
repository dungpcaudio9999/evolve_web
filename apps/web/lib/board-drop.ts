import type { Issue, MoveIssueInput, Status } from '@evolve/shared';

/**
 * Tính tham số cho PATCH /issues/:id/move khi thả issue `draggedId` vào cột `status`
 * tại vị trí `index` (0 = đầu cột, `column.length` = cuối cột).
 * `column` là danh sách issue của cột đích đã sắp theo rank (có thể chứa chính issue đang kéo).
 * Trả về null nếu thả lại đúng chỗ cũ.
 */
export function dropTarget(
  column: Issue[],
  draggedId: string,
  status: Status,
  index: number,
): MoveIssueInput | null {
  const from = column.findIndex((i) => i.id === draggedId);
  if (from !== -1 && (index === from || index === from + 1)) return null;
  const others = column.filter((i) => i.id !== draggedId);
  // Vị trí trong danh sách đã bỏ issue đang kéo.
  const at = from !== -1 && index > from ? index - 1 : index;
  const above = others[at - 1] ?? null;
  const below = others[at] ?? null;
  return { status, afterId: above?.id ?? null, beforeId: below?.id ?? null };
}
