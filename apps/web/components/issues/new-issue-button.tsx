'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUiStore } from '@/store/ui-store';

/** Nút mở modal tạo issue (đặt trong Header); `projectId` để chọn sẵn project. */
export function NewIssueButton({ projectId }: { projectId?: string }) {
  const openCreateIssue = useUiStore((s) => s.openCreateIssue);
  return (
    <Button size="sm" onClick={() => openCreateIssue(projectId)} title="Tạo issue (C)">
      <Plus />
      <span className="hidden sm:inline">New issue</span>
    </Button>
  );
}
