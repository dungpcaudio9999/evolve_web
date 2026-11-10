'use client';

import { STATUSES, STATUS_BY_ID, type Status } from '@evolve/shared';
import { StatusIcon } from '@/components/common/status-icon';
import { SelectorPopover } from './selector-popover';

interface StatusSelectorProps {
  value: Status;
  onChange: (status: Status) => void;
  /** Hiện kèm tên trạng thái (dùng trong modal). Mặc định chỉ icon (dùng trong dòng issue). */
  showLabel?: boolean;
  className?: string;
}

const OPTIONS = STATUSES.map((s) => ({
  value: s.id,
  label: s.name,
  icon: <StatusIcon status={s.id} decorative />,
}));

export function StatusSelector({ value, onChange, showLabel, className }: StatusSelectorProps) {
  return (
    <SelectorPopover
      options={OPTIONS}
      value={value}
      onChange={onChange}
      label={`Trạng thái: ${STATUS_BY_ID[value].name}`}
      searchPlaceholder="Đổi trạng thái…"
      triggerClassName={
        showLabel
          ? `h-8 max-w-full border px-2.5 text-sm whitespace-nowrap ${className ?? ''}`
          : `p-1 ${className ?? ''}`
      }
      trigger={
        <>
          <StatusIcon status={value} decorative />
          {showLabel && STATUS_BY_ID[value].name}
        </>
      }
    />
  );
}
