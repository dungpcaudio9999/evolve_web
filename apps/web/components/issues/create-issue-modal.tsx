'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { createIssueSchema } from '@evolve/shared';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useHotkey } from '@/hooks/use-hotkey';
import { useIssuesStore } from '@/store/issues-store';
import { useUiStore } from '@/store/ui-store';
import { AssigneeSelector } from './assignee-selector';
import { PrioritySelector } from './priority-selector';
import { ProjectSelector } from './project-selector';
import { StatusSelector } from './status-selector';

type FormInput = z.input<typeof createIssueSchema>;
type FormOutput = z.output<typeof createIssueSchema>;

/**
 * Modal tạo issue. Gắn một lần trong layout (main); mở bằng nút "New issue" hoặc phím C.
 * Validate bằng createIssueSchema của @evolve/shared (cùng quy tắc với API).
 */
export function CreateIssueModal() {
  const open = useUiStore((s) => s.createIssueOpen);
  const setOpen = useUiStore((s) => s.setCreateIssueOpen);
  const openCreateIssue = useUiStore((s) => s.openCreateIssue);
  const projects = useIssuesStore((s) => s.projects);
  const users = useIssuesStore((s) => s.users);
  const addIssue = useIssuesStore((s) => s.addIssue);

  useHotkey('c', openCreateIssue);

  const defaults = (): FormInput => ({
    title: '',
    description: '',
    status: 'BACKLOG',
    priority: 'NO_PRIORITY',
    assigneeId: null,
    projectId: projects[0]?.id ?? '',
    labelIds: [],
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(createIssueSchema),
    defaultValues: defaults(),
  });

  // Mỗi lần mở là một form mới.
  useEffect(() => {
    if (open) reset(defaults());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onSubmit = handleSubmit((values) => {
    try {
      const issue = addIssue({ ...values, description: values.description || null });
      toast.success(`Đã tạo ${issue.identifier}`, { description: issue.title });
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không tạo được issue');
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-xl">
        <form onSubmit={onSubmit} noValidate className="grid gap-4">
          <DialogHeader>
            <DialogTitle className="font-sans">Tạo issue</DialogTitle>
            <DialogDescription>Phím tắt: C · Gửi: Ctrl+Enter</DialogDescription>
          </DialogHeader>

          <div className="grid gap-1.5">
            <Input
              aria-label="Tiêu đề"
              placeholder="Tiêu đề issue"
              autoFocus
              aria-invalid={errors.title ? true : undefined}
              {...register('title')}
            />
            {errors.title && (
              <p role="alert" className="text-xs text-destructive">
                {errors.title.message}
              </p>
            )}
          </div>

          <Textarea
            aria-label="Mô tả"
            placeholder="Mô tả (không bắt buộc)"
            rows={4}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) void onSubmit();
            }}
            {...register('description')}
          />

          <div className="flex flex-wrap gap-2">
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <StatusSelector
                  value={field.value ?? 'BACKLOG'}
                  onChange={field.onChange}
                  showLabel
                />
              )}
            />
            <Controller
              control={control}
              name="priority"
              render={({ field }) => (
                <PrioritySelector
                  value={field.value ?? 'NO_PRIORITY'}
                  onChange={field.onChange}
                  showLabel
                />
              )}
            />
            <Controller
              control={control}
              name="assigneeId"
              render={({ field }) => (
                <AssigneeSelector
                  value={field.value ?? null}
                  users={users}
                  onChange={field.onChange}
                  showLabel
                />
              )}
            />
            <Controller
              control={control}
              name="projectId"
              render={({ field }) => (
                <ProjectSelector
                  value={field.value}
                  projects={projects}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
          {errors.projectId && (
            <p role="alert" className="text-xs text-destructive">
              Vui lòng chọn project
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button type="submit">Tạo issue</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
