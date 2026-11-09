'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema } from '@evolve/shared';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
import { FormField } from '@/components/auth/form-field';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type RegisterForm = z.input<typeof registerSchema>;

export default function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm, unknown, z.output<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  const onSubmit = handleSubmit(() => {
    // W3-A2: gọi auth-store.register() và chuyển sang /issues.
    toast.info('Đăng ký sẽ được nối với API ở W3-A2');
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
            Đăng ký
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
