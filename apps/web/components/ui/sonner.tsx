'use client';

import { Toaster as Sonner, type ToasterProps } from 'sonner';

/**
 * Toast (thông báo nhỏ góc màn hình). App chỉ có nền tối nên cố định theme="dark",
 * không cần next-themes như bản shadcn gốc. Màu lấy từ biến theme taalas.
 */
export function Toaster(props: ToasterProps) {
  return (
    <Sonner
      theme="dark"
      position="bottom-right"
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
          '--border-radius': 'var(--radius)',
        } as React.CSSProperties
      }
      {...props}
    />
  );
}
