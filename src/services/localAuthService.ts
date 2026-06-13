import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@ts_users_v1';

export interface LocalUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  passwordHash: string;
  createdAt: string;
  isActive: boolean;
}

function hashPwd(password: string): string {
  const s = 'ts_2024_' + password + '_setu';
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = (((h << 5) + h) ^ s.charCodeAt(i)) >>> 0;
  }
  return h.toString(16) + '_' + password.length;
}

const SEED_USERS: LocalUser[] = [
  {
    id: 'usr_001',
    name: 'Super Admin',
    email: 'admin@trustivasetu.com',
    phone: '9000000000',
    role: 'SUPER_ADMIN',
    passwordHash: hashPwd('mahadev1905'),
    createdAt: new Date().toISOString(),
    isActive: true,
  },
];

async function loadUsers(): Promise<LocalUser[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_USERS));
      return SEED_USERS;
    }
    const stored = JSON.parse(raw) as LocalUser[];
    // Ensure seed admin always exists
    const hasAdmin = stored.some(u => u.id === 'usr_001');
    if (!hasAdmin) {
      const merged = [SEED_USERS[0], ...stored];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      return merged;
    }
    return stored;
  } catch {
    return SEED_USERS;
  }
}

async function saveUsers(users: LocalUser[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

export async function localLogin(
  email: string,
  password: string,
): Promise<{ token: string; user: { id: string; name: string; email: string; phone: string; role: string } }> {
  const users = await loadUsers();
  const match = users.find(
    u => u.email.toLowerCase() === email.trim().toLowerCase() && u.isActive,
  );
  if (!match) throw new Error('No active account found for this email.');
  if (match.passwordHash !== hashPwd(password)) throw new Error('Incorrect password.');
  return {
    token: `local_${match.id}_${Date.now()}`,
    user: { id: match.id, name: match.name, email: match.email, phone: match.phone, role: match.role },
  };
}

export async function getLocalUsers(): Promise<LocalUser[]> {
  return loadUsers();
}

export async function createLocalUser(data: {
  name: string;
  email: string;
  phone: string;
  role: string;
  password: string;
}): Promise<LocalUser> {
  const users = await loadUsers();
  const exists = users.some(u => u.email.toLowerCase() === data.email.trim().toLowerCase());
  if (exists) throw new Error('An account with this email already exists.');
  const newUser: LocalUser = {
    id: `usr_${Date.now()}`,
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    phone: data.phone.trim(),
    role: data.role,
    passwordHash: hashPwd(data.password),
    createdAt: new Date().toISOString(),
    isActive: true,
  };
  await saveUsers([...users, newUser]);
  return newUser;
}

export async function updateLocalUserRole(id: string, role: string): Promise<void> {
  const users = await loadUsers();
  await saveUsers(users.map(u => (u.id === id ? { ...u, role } : u)));
}

export async function resetLocalUserPassword(id: string, newPassword: string): Promise<void> {
  const users = await loadUsers();
  await saveUsers(users.map(u => (u.id === id ? { ...u, passwordHash: hashPwd(newPassword) } : u)));
}

export async function toggleLocalUser(id: string, isActive: boolean): Promise<void> {
  const users = await loadUsers();
  await saveUsers(users.map(u => (u.id === id ? { ...u, isActive } : u)));
}

export async function deleteLocalUser(id: string): Promise<void> {
  const users = await loadUsers();
  await saveUsers(users.filter(u => u.id !== id));
}
