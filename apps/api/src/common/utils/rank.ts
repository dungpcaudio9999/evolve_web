import LexoRank from '@kayron013/lexorank';

/** Rank đứng sau `last` (cuối cột). Cột rỗng thì bắt đầu ở giữa dải "0|i", giống prisma/seed.ts. */
export function rankAfter(last: string | null | undefined): string {
  return last ? LexoRank.between(last, null).toString() : new LexoRank('i').toString();
}

/** Rank nằm giữa `above` (phía trên) và `below` (phía dưới). Thiếu một bên thì đặt sát bên còn lại. */
export function rankBetween(
  above: string | null | undefined,
  below: string | null | undefined,
): string {
  if (above) return LexoRank.between(above, below ?? null).toString();
  if (below) return LexoRank.between(null, below).toString();
  return new LexoRank('i').toString();
}
