import LexoRank from '@kayron013/lexorank';

/**
 * Tính rank (lexorank) cho vị trí nằm giữa `before` và `after` trong một cột.
 * - Cả hai null (cột rỗng): rank giữa dải "0|i".
 * - Chỉ `before`: đặt cuối cột. Chỉ `after`: đặt đầu cột.
 * Cùng thuật toán với apps/api để thứ tự giữ nguyên khi chuyển sang API.
 */
export function rankBetween(before: string | null, after: string | null): string {
  if (before) return LexoRank.between(before, after).toString();
  if (after) return LexoRank.between(null, after).toString();
  return new LexoRank('i').toString();
}

/** So sánh để sắp xếp theo rank tăng dần. */
export function compareRank(a: { rank: string }, b: { rank: string }): number {
  return a.rank < b.rank ? -1 : a.rank > b.rank ? 1 : 0;
}
