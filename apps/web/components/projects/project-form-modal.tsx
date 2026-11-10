'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { createProjectSchema, updateProjectSchema, type Project } from '@evolve/shared';
import { Check } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, useForm, type Resolver } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
import { applyApiError } from '@/components/auth/apply-api-error';
import { FormField } from '@/components/auth/form-field';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useProjectsStore } from '@/store/projects-store';
import { PROJECT_COLORS } from './project-colors';

type FormInput = z.input<typeof createProjectSchema>;

interface ProjectFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Có thì là sửa project (không đổi được key); không có thì là tạo mới. */
  project?: Project;
  onSaved?: (project: Project) => void;
}

/** Modal tạo hoặc sửa project. Validate bằng schema của @evolve/shared. */
export function ProjectFormModal({ open, onOpenChange, project, onSaved }: ProjectFormModalProps) {
  const addProject = useProjectsStore((s) => s.addProject);
  const updateProject = useProjectsStore((s) => s.updateProject);
  const editing = Boolean(project);

  const defaults = (): FormInput => ({
    name: project?.name ?? '',
    key: project?.key ?? '',
    icon: project?.icon ?? '',
    color: project?.color ?? PROJECT_COLORS[0].value,
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormInput>({
    // Khi sửa: schema không có key (không đổi được key) nên kiểu khác lúc tạo.
    resolver: (editing
      ? zodResolver(updateProjectSchema.required({ name: true }))
      : zodResolver(createProjectSchema)) as unknown as Resolver<FormInput>,
    defaultValues: defaults(),
  });

  useEffect(() => {
    if (open) reset(defaults());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, project?.id]);

  const onSubmit = handleSubmit(async (values) => {
    const icon = values.icon?.trim() || null;
    try {
      const saved = project
        ? await updateProject(project.id, { name: values.name, color: values.color, icon })
        : await addProject({ ...values, icon });
      toast.success(project ? 'Đã lưu project' : `Đã tạo project ${saved.key}`);
      onOpenChange(false);
      onSaved?.(saved);
    } catch (error) {
      applyApiError(error, setError, { 409: 'key' });
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={onSubmit} noValidate className="grid gap-4">
          <DialogHeader>
            <DialogTitle className="font-sans">
              {editing ? 'Sửa project' : 'Tạo project'}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? 'Key không đổi được vì đã nằm trong mã của các issue.'
                : 'Key là tiền tố mã issue, ví dụ EVO → EVO-12.'}
            </DialogDescription>
          </DialogHeader>

          <FormField
            id="project-name"
            label="Tên project"
            placeholder="Evolve Web"
            error={errors.name?.message}
            {...register('name')}
          />
          <div className="grid grid-cols-[1fr_auto] items-start gap-3">
            <FormField
              id="project-key"
              label="Key"
              placeholder="EVO"
              maxLength={5}
              disabled={editing}
              className="uppercase"
              error={errors.key?.message}
              {...register('key')}
            />
            <FormField
              id="project-icon"
              label="Icon"
              placeholder="🚀"
              maxLength={4}
              className="w-20 text-center"
              error={errors.icon?.message}
              {...register('icon')}
            />
          </div>

          <fieldset className="grid gap-1.5">
            <legend className="mb-1.5 text-sm font-medium">Màu</legend>
            <Controller
              control={control}
              name="color"
              render={({ field }) => (
                <div role="radiogroup" aria-label="Màu project" className="flex flex-wrap gap-2">
                  {PROJECT_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      role="radio"
                      aria-checked={field.value === c.value}
                      aria-label={c.name}
                      title={c.name}
                      onClick={() => field.onChange(c.value)}
                      className={cn(
                        'flex size-7 items-center justify-center rounded-full ring-offset-2 ring-offset-background outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        field.value === c.value && 'ring-2 ring-foreground',
                      )}
                      style={{ backgroundColor: c.value }}
                    >
                      {field.value === c.value && <Check className="size-4 text-background" />}
                    </button>
                  ))}
                </div>
              )}
            />
          </fieldset>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {editing ? 'Lưu' : 'Tạo project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
