import type { User } from '@evolve/shared';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

type UserAvatarUser = Pick<User, 'name' | 'avatarUrl'>;

interface UserAvatarProps {
  /** `null` = chưa giao cho ai. */
  user: UserAvatarUser | null;
  /** Kích thước (px). Mặc định 24. */
  size?: number;
  className?: string;
  /** Avatar chỉ để trang trí (tên đã hiện bên cạnh): ẩn khỏi trình đọc màn hình. */
  decorative?: boolean;
}

/** "Nguyễn Văn An" → "NA"; "an" → "A". */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

/** Avatar người dùng; không có ảnh thì hiện chữ cái đầu, chưa giao thì hiện vòng nét đứt. */
export function UserAvatar({ user, size = 24, className, decorative }: UserAvatarProps) {
  const style = { width: size, height: size, fontSize: Math.round(size * 0.42) };

  if (!user) {
    return (
      <span
        role={decorative ? undefined : 'img'}
        aria-label={decorative ? undefined : 'Chưa giao'}
        aria-hidden={decorative || undefined}
        title={decorative ? undefined : 'Chưa giao'}
        className={cn(
          'inline-block shrink-0 rounded-full border border-dashed border-muted-foreground/60',
          className,
        )}
        style={style}
      />
    );
  }

  return (
    <Avatar
      className={cn('shrink-0', className)}
      style={style}
      title={decorative ? undefined : user.name}
      aria-hidden={decorative || undefined}
    >
      {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
    </Avatar>
  );
}
