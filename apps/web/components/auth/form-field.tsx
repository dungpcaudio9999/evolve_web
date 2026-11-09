import type { ComponentProps } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FormFieldProps extends ComponentProps<typeof Input> {
  id: string;
  label: string;
  /** Thông báo lỗi của trường (từ react-hook-form hoặc từ API). */
  error?: string;
}

/** Ô nhập có nhãn và dòng báo lỗi, liên kết bằng aria để trình đọc màn hình đọc được lỗi. */
export function FormField({ id, label, error, ...inputProps }: FormFieldProps) {
  const errorId = `${id}-error`;
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        {...inputProps}
      />
      {error && (
        <p id={errorId} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
