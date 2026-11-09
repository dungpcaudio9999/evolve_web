'use client';

import { Check } from 'lucide-react';
import { useState, type ReactNode } from 'react';
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

export interface SelectorOption<T extends string> {
  value: T;
  label: string;
  icon: ReactNode;
}

interface SelectorPopoverProps<T extends string> {
  options: SelectorOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Nội dung nút mở (icon, hoặc icon + nhãn). */
  trigger: ReactNode;
  /** Mô tả cho trình đọc màn hình, ví dụ "Đổi trạng thái". */
  label: string;
  searchPlaceholder: string;
  triggerClassName?: string;
}

/**
 * Popover chọn một giá trị có ô tìm kiếm (dùng chung cho status, priority, assignee).
 * Bàn phím: mũi tên để di chuyển, Enter để chọn, Esc để đóng (cmdk + Radix lo).
 */
export function SelectorPopover<T extends string>({
  options,
  value,
  onChange,
  trigger,
  label,
  searchPlaceholder,
  triggerClassName,
}: SelectorPopoverProps<T>) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-label={label}
        title={label}
        // Không để click lan ra dòng issue (sau này dòng sẽ mở trang chi tiết).
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'inline-flex shrink-0 items-center gap-2 rounded-md outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring',
          triggerClassName,
        )}
      >
        {trigger}
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0" align="start" onClick={(e) => e.stopPropagation()}>
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>Không có kết quả</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  // cmdk lọc theo `value`; dùng nhãn để gõ tiếng Việt tìm được.
                  value={`${option.label} ${option.value}`}
                  onSelect={() => {
                    if (option.value !== value) onChange(option.value);
                    setOpen(false);
                  }}
                >
                  {option.icon}
                  <span className="flex-1">{option.label}</span>
                  {option.value === value && <Check className="size-4 text-primary" />}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
