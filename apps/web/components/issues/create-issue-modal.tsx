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
import { useProjectsStore } from '@/store/projects-store';
import { useUiStore } from '@/store/ui-store';
import { AssigneeSelector } from './assignee-selector';
import { LabelSelector } from './label-selector';
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
  const projects = useProjectsStore((s) => s.projects);
  const projectsStatus = useProjectsStore((s) => s.status);
  const fetchProjects = useProjectsStore((s) => s.fetchProjects);
  const users = useIssuesStore((s) => s.users);
  const labels = useIssuesStore((s) => s.labels);
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
    getValues,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(createIssueSchema),
    defaultValues: defaults(),
  });

  // Lần đầu mở modal mà chưa có danh sách project thì tải.
  useEffect(() => {
    if (open && projectsStatus === 'idle') void fetchProjects();
  }, [open, projectsStatus, fetchProjects]);

  // Mỗi lần mở là một form mới.
  useEffect(() => {
    if (open) reset(defaults());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Project tải xong sau khi đã mở: chỉ điền ô project nếu còn trống (không xóa chữ đang gõ).
  useEffect(() => {
    if (open && projects[0] && !getValues('projectId')) setValue('projectId', projects[0].id);
  }, [open, projects, getValues, setValue]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      const issue = await addIssue({ ...values, description: values.description || null });
      toast.success(`Đã tạo ${issue.identifier}`, { description: issue.title });
      setOpen(false);
    } catch {
      // api-client đã hiện toast lỗi; giữ modal mở để người dùng sửa và gửi lại.
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
              name="labelIds"
              render={({ field }) => (
                <LabelSelector
                  value={field.value ?? []}
                  labels={labels}
                  onChange={field.onChange}
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Đang tạo…' : 'Tạo issue'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
