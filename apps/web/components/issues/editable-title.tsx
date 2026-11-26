'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface EditableTitleProps {
  value: string;
  onSave: (title: string) => void;
  className?: string;
}

/** Tiêu đề sửa tại chỗ: Enter hoặc bấm ra ngoài để lưu, Esc để hủy. Bỏ trống thì giữ tiêu đề cũ. */
export function EditableTitle({ value, onSave, className }: EditableTitleProps) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);

  const commit = () => {
    const title = draft.trim();
    if (!title) return setDraft(value);
    if (title !== value) onSave(title);
  };

  return (
    <input
      aria-label="Tiêu đề issue"
      value={draft}
      maxLength={200}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') e.currentTarget.blur();
        if (e.key === 'Escape') {
          setDraft(value);
          // Đặt lại giá trị trước khi blur để commit() không lưu bản nháp.
          requestAnimationFrame(() => (e.target as HTMLInputElement).blur());
        }
      }}
      className={cn(
        'w-full rounded-md bg-transparent px-1 py-0.5 text-2xl font-semibold outline-none hover:bg-accent/40 focus:bg-accent/40 focus-visible:ring-2 focus-visible:ring-ring',
        className,
      )}
    />
  );
}
