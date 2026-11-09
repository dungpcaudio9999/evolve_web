import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import { toast } from 'sonner';
import { ApiError } from '@/lib/api-client';

/**
 * Hiển thị lỗi API lên form: lỗi theo từng trường (400) gắn vào ô tương ứng,
 * lỗi đã biết (401, 409) gắn vào `fieldForStatus`, còn lại hiện toast.
 */
export function applyApiError<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fieldForStatus: Partial<Record<number, Path<T>>>,
) {
  if (!(error instanceof ApiError)) {
    toast.error('Đã có lỗi xảy ra');
    return;
  }
  if (error.errors) {
    for (const [field, messages] of Object.entries(error.errors)) {
      setError(field as Path<T>, { message: messages[0] });
    }
    return;
  }
  const field = fieldForStatus[error.status];
  if (field) setError(field, { message: error.message });
  else toast.error(error.message);
}
