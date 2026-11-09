/**
 * Chuẩn bị môi trường test. Chỉ áp dụng cho file chạy trong jsdom (test component).
 * Radix (Popover, Dialog) và cmdk dùng vài API trình duyệt mà jsdom chưa có.
 */
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  afterEach(() => cleanup());

  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  globalThis.ResizeObserver ??= ResizeObserverStub;
  Element.prototype.scrollIntoView ??= function scrollIntoView() {};
  Element.prototype.hasPointerCapture ??= () => false;
  Element.prototype.releasePointerCapture ??= () => {};
}
