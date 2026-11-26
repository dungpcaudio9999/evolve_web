'use client';

import type { Issue } from '@evolve/shared';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface DeleteIssueDialogProps {
  issue: Pick<Issue, 'identifier' | 'title'> | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

/** Hộp thoại xác nhận trước khi xóa issue (không hoàn tác được). */
export function DeleteIssueDialog({ issue, onOpenChange, onConfirm }: DeleteIssueDialogProps) {
  return (
    <AlertDialog open={issue !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-sans">Xóa {issue?.identifier}?</AlertDialogTitle>
          <AlertDialogDescription>
            Issue “{issue?.title}” sẽ bị xóa vĩnh viễn và không khôi phục được.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Hủy</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirm}>
            Xóa issue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
