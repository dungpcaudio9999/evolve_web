'use client';

import type { User } from '@evolve/shared';
import { useMemo } from 'react';
import { UserAvatar } from '@/components/common/user-avatar';
import { SelectorPopover } from './selector-popover';

/** Giá trị đại diện cho "chưa giao" trong danh sách lựa chọn. */
const NONE = '__none__';

interface AssigneeSelectorProps {
  /** `null` = chưa giao. */
  value: string | null;
  users: User[];
  onChange: (assigneeId: string | null) => void;
  showLabel?: boolean;
  className?: string;
}

export function AssigneeSelector({
  value,
  users,
  onChange,
  showLabel,
  className,
}: AssigneeSelectorProps) {
  const options = useMemo(
    () => [
      { value: NONE, label: 'Chưa giao', icon: <UserAvatar user={null} size={20} decorative /> },
      ...users.map((u) => ({
        value: u.id,
        label: u.name,
        icon: <UserAvatar user={u} size={20} decorative />,
      })),
    ],
    [users],
  );
  const current = users.find((u) => u.id === value) ?? null;

  return (
    <SelectorPopover
      options={options}
      value={value ?? NONE}
      onChange={(v) => onChange(v === NONE ? null : v)}
      label={`Người được giao: ${current?.name ?? 'Chưa giao'}`}
      searchPlaceholder="Giao cho…"
      triggerClassName={
        showLabel
          ? `h-8 max-w-full border px-2.5 text-sm whitespace-nowrap ${className ?? ''}`
          : `rounded-full ${className ?? ''}`
      }
      trigger={
        <>
          <UserAvatar user={current} size={showLabel ? 20 : 22} decorative />
          {showLabel && <span className="truncate">{current?.name ?? 'Chưa giao'}</span>}
        </>
      }
    />
  );
}
