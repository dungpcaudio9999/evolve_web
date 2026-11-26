import * as SecureStore from 'expo-secure-store';

/**
 * Lưu JWT trong SecureStore (Keychain / Keystore) thay cho localStorage của web.
 * Giữ bản trong bộ nhớ để api-client đọc đồng bộ.
 */
const KEY = 'evolve.token';
let cached: string | null = null;

export async function loadToken(): Promise<string | null> {
  cached = await SecureStore.getItemAsync(KEY);
  return cached;
}

export const getToken = () => cached;

export async function setToken(token: string) {
  cached = token;
  await SecureStore.setItemAsync(KEY, token);
}

export async function clearToken() {
  cached = null;
  await SecureStore.deleteItemAsync(KEY);
}
