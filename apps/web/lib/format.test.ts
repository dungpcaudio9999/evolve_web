import { describe, expect, it } from 'vitest';
import { formatShortDate } from './format';

describe('formatShortDate', () => {
  it('định dạng ngày ngắn theo tiếng Việt, múi giờ Việt Nam', () => {
    // 20:00 UTC ngày 1 = 03:00 ngày 2 ở Việt Nam
    expect(formatShortDate('2026-11-01T20:00:00.000Z')).toBe('2 thg 11');
  });
});
