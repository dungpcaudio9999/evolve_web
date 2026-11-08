'use client';

import type { ReactNode } from 'react';
import { PRIORITIES, STATUSES } from '@evolve/shared';
import { PriorityIcon } from '@/components/common/priority-icon';
import { StatusIcon } from '@/components/common/status-icon';
import { UserAvatar } from '@/components/common/user-avatar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-medium text-muted-foreground">{title}</h2>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </section>
  );
}

/** Trang xem thử component trong lúc phát triển (W1-C2, W1-C3). Không dùng cho người dùng cuối. */
export default function DevUiPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-8 p-8">
      <header className="space-y-1">
        <h1 className="text-gradient text-2xl font-semibold">UI components</h1>
        <p className="text-sm text-muted-foreground">
          12 component shadcn/ui dùng trong Evolve Web.
        </p>
      </header>

      <Section title="theme taalas">
        {[
          ['bg-background', 'background'],
          ['bg-card', 'card'],
          ['bg-primary', 'primary'],
          ['bg-secondary', 'secondary'],
          ['bg-accent', 'accent'],
          ['bg-brand-ice', 'ice'],
          ['bg-brand-cream', 'cream'],
          ['bg-brand-teal', 'teal'],
        ].map(([cls, name]) => (
          <span
            key={name}
            className="flex flex-col items-center gap-1 text-xs text-muted-foreground"
          >
            <span className={`size-10 rounded-md border ${cls}`} />
            {name}
          </span>
        ))}
      </Section>

      <h2 className="text-lg font-semibold">components/common</h2>

      <Section title="status-icon">
        {STATUSES.map((s) => (
          <span key={s.id} className="flex items-center gap-1.5 text-sm">
            <StatusIcon status={s.id} />
            {s.name}
          </span>
        ))}
      </Section>

      <Section title="priority-icon">
        {PRIORITIES.map((p) => (
          <span key={p.id} className="flex items-center gap-1.5 text-sm">
            <PriorityIcon priority={p.id} />
            {p.name}
          </span>
        ))}
      </Section>

      <Section title="user-avatar">
        <UserAvatar user={{ name: 'Nguyễn Văn An', avatarUrl: null }} />
        <UserAvatar user={{ name: 'shadcn', avatarUrl: 'https://github.com/shadcn.png' }} />
        <UserAvatar user={{ name: 'Trần Bình', avatarUrl: null }} size={32} />
        <UserAvatar user={null} />
      </Section>

      <Separator />
      <h2 className="text-lg font-semibold">components/ui</h2>

      <Section title="button">
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Destructive</Button>
      </Section>

      <Section title="input · textarea">
        <Input placeholder="Tiêu đề issue" className="max-w-xs" />
        <Textarea placeholder="Mô tả…" className="max-w-md" />
      </Section>

      <Section title="badge">
        <Badge>Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="outline">Outline</Badge>
      </Section>

      <Section title="avatar">
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" alt="shadcn" />
          <AvatarFallback>SC</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback>EV</AvatarFallback>
        </Avatar>
      </Section>

      <Section title="dialog">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Mở dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tạo issue</DialogTitle>
              <DialogDescription>Ví dụ dialog, sẽ dùng cho modal tạo issue.</DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </Section>

      <Section title="dropdown-menu">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Mở menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Tài khoản</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Hồ sơ</DropdownMenuItem>
            <DropdownMenuItem>Đăng xuất</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Section>

      <Section title="popover · command">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">Chọn trạng thái</Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-0">
            <Command>
              <CommandInput placeholder="Tìm…" />
              <CommandList>
                <CommandEmpty>Không có kết quả</CommandEmpty>
                <CommandGroup>
                  <CommandItem>Backlog</CommandItem>
                  <CommandItem>Todo</CommandItem>
                  <CommandItem>In Progress</CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </Section>

      <Section title="context-menu">
        <ContextMenu>
          <ContextMenuTrigger className="rounded-md border border-dashed px-6 py-4 text-sm">
            Chuột phải vào đây
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem>Đổi trạng thái</ContextMenuItem>
            <ContextMenuItem variant="destructive">Xóa</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </Section>

      <Section title="tooltip">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost">Di chuột vào</Button>
          </TooltipTrigger>
          <TooltipContent>Tạo issue (C)</TooltipContent>
        </Tooltip>
      </Section>

      <Section title="separator">
        <div className="flex h-6 items-center gap-3 text-sm">
          <span>Issues</span>
          <Separator orientation="vertical" />
          <span>Projects</span>
        </div>
      </Section>
    </main>
  );
}
