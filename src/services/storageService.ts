import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_KEY = '@trustiva:auth';

export async function saveAuthState(value: string) {
  await AsyncStorage.setItem(AUTH_KEY, value);
}

export async function loadAuthState() {
  const stored = await AsyncStorage.getItem(AUTH_KEY);
  return stored;
}

export async function removeAuthState() {
  await AsyncStorage.removeItem(AUTH_KEY);
}
