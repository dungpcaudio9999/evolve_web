import { loginSchema } from '@evolve/shared';
import { Link } from 'expo-router';
import { useState } from 'react';
import { ApiError } from '../../lib/api-client';
import { useAuthStore } from '../../store/auth-store';
import { AuthForm, Field } from '../../components/auth-form';

export default function LoginScreen() {
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Dữ liệu không hợp lệ');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await login(parsed.data); // layout gốc tự chuyển sang (main)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Đăng nhập thất bại');
      setBusy(false);
    }
  };

  return (
    <AuthForm
      title="Đăng nhập"
      submitLabel="Đăng nhập"
      busy={busy}
      error={error}
      onSubmit={submit}
      footer={<Link href="/register">Chưa có tài khoản? Đăng ký</Link>}
    >
      <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
      <Field label="Mật khẩu" value={password} onChangeText={setPassword} secureTextEntry />
    </AuthForm>
  );
}
