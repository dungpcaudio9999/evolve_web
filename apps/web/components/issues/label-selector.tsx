'use client';

import type { Label } from '@evolve/shared';
import { Check, Tag } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { LabelBadge } from './label-badge';

interface LabelSelectorProps {
  /** id các nhãn đang chọn. */
  value: string[];
  labels: Label[];
  onChange: (labelIds: string[]) => void;
  className?: string;
}

/** Chọn nhiều nhãn: bấm để bật/tắt từng nhãn, popover vẫn mở để chọn tiếp. */
export function LabelSelector({ value, labels, onChange, className }: LabelSelectorProps) {
  const selected = labels.filter((l) => value.includes(l.id));
  const toggle = (id: string) =>
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);

  return (
    <Popover>
      <PopoverTrigger
        aria-label={`Nhãn: ${selected.map((l) => l.name).join(', ') || 'chưa có'}`}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'inline-flex min-h-8 flex-wrap items-center gap-1 rounded-md border px-2 py-1 text-sm outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring',
          className,
        )}
      >
        {selected.length > 0 ? (
          selected.map((label) => <LabelBadge key={label.id} label={label} />)
        ) : (
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Tag className="size-3.5" aria-hidden />
            Nhãn
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0" align="start">
        <Command>
          <CommandInput placeholder="Tìm nhãn…" />
          <CommandList>
            <CommandEmpty>Không có nhãn</CommandEmpty>
            <CommandGroup>
              {labels.map((label) => {
                const checked = value.includes(label.id);
                return (
                  <CommandItem
                    key={label.id}
                    value={label.name}
                    aria-checked={checked}
                    onSelect={() => toggle(label.id)}
                  >
                    <span
                      className="size-2.5 rounded-full"
                      style={{ backgroundColor: label.color }}
                      aria-hidden
                    />
                    <span className="flex-1">{label.name}</span>
                    {checked && <Check className="size-4 text-primary" />}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
