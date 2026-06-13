import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from '../types/auth';

const USER_KEY = '@trustiva:user';

export async function saveUser(user: UserProfile): Promise<void> {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function loadUser(): Promise<UserProfile | null> {
  const raw = await AsyncStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

export async function clearUser(): Promise<void> {
  await AsyncStorage.removeItem(USER_KEY);
}

// Legacy aliases used across the codebase — delegate to the new functions
export const saveAuthState = async (
  _token: string,
  _refreshToken: string,
  user: UserProfile,
): Promise<void> => saveUser(user);

export const clearAuthState = clearUser;
