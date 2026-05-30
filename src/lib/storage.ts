const PREFIX = 'pw_';

export function load<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function save(key: string, value: unknown): void {
  localStorage.setItem(PREFIX + key, JSON.stringify(value));
}

export function remove(key: string): void {
  localStorage.removeItem(PREFIX + key);
}

export const STORAGE_KEYS = {
  USER_CURRENT: 'user_current',
  USERS: 'users',
  WORLDS: 'worlds',
  ENTRIES: 'entries',
  FRIENDS: 'friends',
  RESONANCES: 'resonances',
  CRYSTAL_CACHE: 'crystal_cache',
  APP_SETTINGS: 'app_settings',
} as const;
