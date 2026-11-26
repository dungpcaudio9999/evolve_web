'use client';

import { PRIORITIES, PRIORITY_BY_ID, type Priority } from '@evolve/shared';
import { PriorityIcon } from '@/components/common/priority-icon';
import { SelectorPopover } from './selector-popover';

interface PrioritySelectorProps {
  value: Priority;
  onChange: (priority: Priority) => void;
  showLabel?: boolean;
  className?: string;
}

const OPTIONS = PRIORITIES.map((p) => ({
  value: p.id,
  label: p.name,
  icon: <PriorityIcon priority={p.id} className="text-muted-foreground" decorative />,
}));

export function PrioritySelector({ value, onChange, showLabel, className }: PrioritySelectorProps) {
  return (
    <SelectorPopover
      options={OPTIONS}
      value={value}
      onChange={onChange}
      label={`Độ ưu tiên: ${PRIORITY_BY_ID[value].name}`}
      searchPlaceholder="Đổi độ ưu tiên…"
      triggerClassName={
        showLabel
          ? `h-8 max-w-full border px-2.5 text-sm whitespace-nowrap ${className ?? ''}`
          : `p-1 ${className ?? ''}`
      }
      trigger={
        <>
          <PriorityIcon priority={value} className="text-muted-foreground" decorative />
          {showLabel && PRIORITY_BY_ID[value].name}
        </>
      }
    />
  );
}
