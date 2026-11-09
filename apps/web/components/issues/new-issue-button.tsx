'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUiStore } from '@/store/ui-store';

/** Nút mở modal tạo issue (đặt trong Header). */
export function NewIssueButton() {
  const openCreateIssue = useUiStore((s) => s.openCreateIssue);
  return (
    <Button size="sm" onClick={openCreateIssue} title="Tạo issue (C)">
      <Plus />
      <span className="hidden sm:inline">New issue</span>
    </Button>
  );
}
