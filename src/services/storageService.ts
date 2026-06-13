import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from '../types/auth';

const KEYS = {
  TOKEN: '@trustiva:token',
  REFRESH_TOKEN: '@trustiva:refreshToken',
  USER: '@trustiva:user',
} as const;

export async function saveAuthState(
  token: string,
  refreshToken: string,
  user: UserProfile,
): Promise<void> {
  await AsyncStorage.multiSet([
    [KEYS.TOKEN, token],
    [KEYS.REFRESH_TOKEN, refreshToken],
    [KEYS.USER, JSON.stringify(user)],
  ]);
}

export async function saveAuthTokens(token: string, refreshToken: string): Promise<void> {
  await AsyncStorage.multiSet([
    [KEYS.TOKEN, token],
    [KEYS.REFRESH_TOKEN, refreshToken],
  ]);
}

export async function loadAuthState(): Promise<{
  token: string;
  refreshToken: string;
  user: UserProfile;
} | null> {
  const results = await AsyncStorage.multiGet([KEYS.TOKEN, KEYS.REFRESH_TOKEN, KEYS.USER]);
  const token = results[0][1];
  const refreshToken = results[1][1];
  const userRaw = results[2][1];

  if (!token || !refreshToken || !userRaw) return null;

  try {
    const user = JSON.parse(userRaw) as UserProfile;
    return { token, refreshToken, user };
  } catch {
    return null;
  }
}

export async function clearAuthState(): Promise<void> {
  await AsyncStorage.multiRemove([KEYS.TOKEN, KEYS.REFRESH_TOKEN, KEYS.USER]);
}
