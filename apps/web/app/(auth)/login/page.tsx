'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@evolve/shared';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
import { FormField } from '@/components/auth/form-field';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type LoginForm = z.input<typeof loginSchema>;

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm, unknown, z.output<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(() => {
    // W3-A2: gọi auth-store.login() và chuyển sang /issues.
    toast.info('Đăng nhập sẽ được nối với API ở W3-A2');
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
            Đăng nhập
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
