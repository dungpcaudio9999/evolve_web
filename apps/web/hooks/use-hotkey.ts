'use client';

import { useEffect, useRef } from 'react';

/** true nếu người dùng đang gõ chữ (ô nhập, vùng soạn thảo) → không kích hoạt phím tắt. */
export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  return ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
}

/**
 * Phím tắt một phím (không kèm Ctrl/Alt/Meta), ví dụ `useHotkey('c', openCreateIssue)`.
 * Bỏ qua khi đang gõ trong ô nhập, khi đang có hộp thoại mở, hoặc khi phím bị giữ lặp.
 */
export function useHotkey(key: string, handler: () => void) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key.toLowerCase() !== key.toLowerCase()) return;
      if (isTypingTarget(e.target)) return;
      if (document.querySelector('[role="dialog"]')) return;
      e.preventDefault();
      handlerRef.current();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [key]);
}
