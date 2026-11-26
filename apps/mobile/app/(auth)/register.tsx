import { registerSchema } from '@evolve/shared';
import { Link } from 'expo-router';
import { useState } from 'react';
import { ApiError } from '../../lib/api-client';
import { useAuthStore } from '../../store/auth-store';
import { AuthForm, Field } from '../../components/auth-form';

export default function RegisterScreen() {
  const register = useAuthStore((s) => s.register);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const parsed = registerSchema.safeParse({ name, email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Dữ liệu không hợp lệ');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await register(parsed.data);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Đăng ký thất bại');
      setBusy(false);
    }
  };

  return (
    <AuthForm
      title="Đăng ký"
      submitLabel="Tạo tài khoản"
      busy={busy}
      error={error}
      onSubmit={submit}
      footer={<Link href="/login">Đã có tài khoản? Đăng nhập</Link>}
    >
      <Field label="Tên" value={name} onChangeText={setName} autoCapitalize="words" />
      <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
      <Field label="Mật khẩu" value={password} onChangeText={setPassword} secureTextEntry />
    </AuthForm>
  );
}
