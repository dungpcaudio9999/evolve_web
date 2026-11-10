import LexoRank from '@kayron013/lexorank';

/** Rank đứng sau `last` (cuối cột). Cột rỗng thì bắt đầu ở giữa dải "0|i", giống prisma/seed.ts. */
export function rankAfter(last: string | null | undefined): string {
  return last ? LexoRank.between(last, null).toString() : new LexoRank('i').toString();
}
