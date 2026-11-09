'use client';

import type { Project } from '@evolve/shared';
import { useMemo } from 'react';
import { SelectorPopover } from './selector-popover';

interface ProjectSelectorProps {
  value: string;
  projects: Project[];
  onChange: (projectId: string) => void;
}

export function ProjectSelector({ value, projects, onChange }: ProjectSelectorProps) {
  const options = useMemo(
    () =>
      projects.map((p) => ({
        value: p.id,
        label: `${p.name} (${p.key})`,
        icon: <span aria-hidden>{p.icon ?? '📁'}</span>,
      })),
    [projects],
  );
  const current = projects.find((p) => p.id === value);

  return (
    <SelectorPopover
      options={options}
      value={value}
      onChange={onChange}
      label={`Project: ${current?.name ?? 'chưa chọn'}`}
      searchPlaceholder="Chọn project…"
      triggerClassName="h-8 border px-2.5 text-sm"
      trigger={
        <>
          <span aria-hidden>{current?.icon ?? '📁'}</span>
          {current ? current.key : 'Chọn project'}
        </>
      }
    />
  );
}
