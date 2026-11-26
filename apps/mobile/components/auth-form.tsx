import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { colors, radius } from '../lib/theme';

interface AuthFormProps {
  title: string;
  submitLabel: string;
  busy: boolean;
  error: string | null;
  onSubmit: () => void;
  footer: ReactNode;
  children: ReactNode;
}

/** Khung chung cho màn hình đăng nhập / đăng ký. */
export function AuthForm({
  title,
  submitLabel,
  busy,
  error,
  onSubmit,
  footer,
  children,
}: AuthFormProps) {
  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.logo}>EVOLVE</Text>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.card}>
        {children}
        {error && <Text style={styles.error}>{error}</Text>}
        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          onPress={onSubmit}
          disabled={busy}
        >
          {busy ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <Text style={styles.buttonText}>{submitLabel}</Text>
          )}
        </Pressable>
      </View>
      <Text style={styles.footer}>{footer}</Text>
    </KeyboardAvoidingView>
  );
}

export function Field({ label, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholderTextColor={colors.muted}
        autoCapitalize="none"
        autoCorrect={false}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: colors.background },
  logo: {
    color: colors.primary,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 6,
    textAlign: 'center',
  },
  title: {
    color: colors.foreground,
    fontSize: 20,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.card,
    padding: 20,
    gap: 16,
  },
  label: { color: colors.muted, fontSize: 13 },
  input: {
    color: colors.foreground,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  error: { color: colors.danger, fontSize: 13 },
  button: {
    borderColor: colors.primary,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonPressed: { backgroundColor: 'rgba(232,176,124,0.15)' },
  buttonText: { color: colors.primary, fontWeight: '600', fontSize: 15 },
  footer: { color: colors.muted, textAlign: 'center', marginTop: 20 },
});
