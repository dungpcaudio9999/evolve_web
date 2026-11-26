'use client';

import type { Issue } from '@evolve/shared';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { StatusIcon } from '@/components/common/status-icon';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { api } from '@/lib/api-client';

/**
 * Tìm issue theo tiêu đề hoặc mã (Ctrl+K / ⌘K), Enter để mở trang chi tiết (W5-C3).
 * Mỗi lần mở tải lại toàn bộ issue của người dùng (GET /issues) để không phụ thuộc trang đang xem;
 * lọc theo từ khóa làm trên trình duyệt bằng cmdk.
 */
export function SearchCommand() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [issues, setIssues] = useState<Issue[] | null>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && !e.altKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setIssues(null);
    api
      .get<Issue[]>('/issues')
      .then((rows) => !cancelled && setIssues(rows))
      .catch(() => !cancelled && setIssues([]));
    return () => {
      cancelled = true;
    };
  }, [open]);

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Tìm issue"
      description="Gõ tiêu đề hoặc mã issue, Enter để mở"
    >
      <Command>
        <CommandInput placeholder="Tìm issue theo tiêu đề hoặc mã…" />
        <CommandList>
          {issues === null ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Đang tải…</p>
          ) : (
            <>
              <CommandEmpty>Không tìm thấy issue nào.</CommandEmpty>
              <CommandGroup heading="Issues">
                {issues.map((issue) => (
                  <CommandItem
                    key={issue.id}
                    value={`${issue.identifier} ${issue.title} ${issue.id}`}
                    onSelect={() => {
                      setOpen(false);
                      router.push(`/issues/${issue.id}`);
                    }}
                  >
                    <StatusIcon status={issue.status} decorative />
                    <span className="w-16 shrink-0 font-mono text-xs text-muted-foreground">
                      {issue.identifier}
                    </span>
                    <span className="truncate">{issue.title}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
