'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@evolve/shared';
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

type LoginForm = z.input<typeof loginSchema>;

function LoginContent() {
  const login = useAuthStore((s) => s.login);
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm, unknown, z.output<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await login(values);
      router.replace(safeNextPath(searchParams.get('next')));
    } catch (error) {
      applyApiError(error, setError, { 401: 'password' });
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-sans text-xl font-semibold">Đăng nhập</CardTitle>
        <CardDescription>Chào mừng bạn quay lại Evolve.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} noValidate className="grid gap-4">
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
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password')}
          />
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Đang đăng nhập…' : 'Đăng nhập'}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Chưa có tài khoản?{' '}
            <Link href="/register" className="text-primary underline-offset-4 hover:underline">
              Đăng ký
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

/** useSearchParams cần Suspense để trang vẫn được render tĩnh khi build. */
export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
