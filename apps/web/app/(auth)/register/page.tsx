'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema } from '@evolve/shared';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';
import { applyApiError } from '@/components/auth/apply-api-error';
import { FormField } from '@/components/auth/form-field';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { safeNextPath, useAuthStore } from '@/store/auth-store';

type RegisterForm = z.input<typeof registerSchema>;

function RegisterContent() {
  const registerAccount = useAuthStore((s) => s.register);
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm, unknown, z.output<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await registerAccount(values);
      router.replace(safeNextPath(searchParams.get('next')));
    } catch (error) {
      applyApiError(error, setError, { 409: 'email' });
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-sans text-xl font-semibold">Tạo tài khoản</CardTitle>
        <CardDescription>Bắt đầu quản lý dự án cùng nhóm của bạn.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} noValidate className="grid gap-4">
          <FormField
            id="name"
            label="Họ tên"
            autoComplete="name"
            placeholder="Nguyễn Văn An"
            error={errors.name?.message}
            {...register('name')}
          />
          <FormField
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="ban@evolve.dev"
            error={errors.email?.message}
            {...register('email')}
          />
          <FormField
            id="password"
            label="Mật khẩu"
            type="password"
            autoComplete="new-password"
            placeholder="Tối thiểu 8 ký tự"
            error={errors.password?.message}
            {...register('password')}
          />
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Đang tạo tài khoản…' : 'Đăng ký'}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Đã có tài khoản?{' '}
            <Link href="/login" className="text-primary underline-offset-4 hover:underline">
              Đăng nhập
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

/** useSearchParams cần Suspense để trang vẫn được render tĩnh khi build. */
export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterContent />
    </Suspense>
  );
}
