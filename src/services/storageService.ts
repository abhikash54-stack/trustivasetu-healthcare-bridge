import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { UserProfile } from '../types/auth';

const USER_KEY = 'trustiva_user';
const LEGACY_KEYS = ['@trustiva:auth', '@trustiva:session', '@trustiva:profile'];

export async function saveUser(user: UserProfile): Promise<void> {
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
}

export async function loadUser(): Promise<UserProfile | null> {
  const raw = await SecureStore.getItemAsync(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

export async function clearUser(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(USER_KEY),
    ...LEGACY_KEYS.map((key) => AsyncStorage.removeItem(key)),
  ]);
}

// Legacy aliases used across the codebase — delegate to the new functions
export const saveAuthState = async (
  _token: string,
  _refreshToken: string,
  user: UserProfile,
): Promise<void> => saveUser(user);

export const clearAuthState = clearUser;
