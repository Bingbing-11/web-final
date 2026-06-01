import { create } from 'zustand';
import type { User } from '../types/user';
import * as api from '../lib/api';

interface ProfileStats {
  memoriesCount: number;
  streakDays: number;
}

interface AuthState {
  currentUser: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  profileStats: ProfileStats | null;
  statsLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, nickname: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  checkAuth: () => Promise<void>;
  fetchStats: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  currentUser: api.tokenManager.getUser(),
  isLoggedIn: !!api.tokenManager.get(),
  isLoading: false,
  profileStats: null,
  statsLoading: false,

  login: async (username: string, password: string) => {
    try {
      const res: any = await api.post('/api/auth/login', { username, password });
      if (res.code === 200 && res.data) {
        api.tokenManager.save(res.data.token, res.data.user);
        set({ currentUser: res.data.user, isLoggedIn: true });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  register: async (username: string, nickname: string, password: string) => {
    try {
      const res: any = await api.post('/api/auth/register', { username, nickname, password });
      if (res.code === 200 && res.data) {
        api.tokenManager.save(res.data.token, res.data.user);
        set({ currentUser: res.data.user, isLoggedIn: true });
        return { ok: true };
      }
      return { ok: false, message: res.message || '注册失败，请稍后再试' };
    } catch (err: any) {
      if (err && err.message) {
        return { ok: false, message: err.message };
      }
      return { ok: false, message: '网络异常，请稍后再试' };
    }
  },

  logout: async () => {
    try {
      await api.post('/api/auth/logout');
    } catch {
      // Ignore logout API errors
    }
    api.tokenManager.clear();
    set({ currentUser: null, isLoggedIn: false, profileStats: null });
  },

  updateProfile: async (updates: Partial<User>) => {
    try {
      await api.put('/api/users/profile', updates);
      const user = get().currentUser;
      if (user) {
        const updated = { ...user, ...updates };
        set({ currentUser: updated });
        api.tokenManager.save(api.tokenManager.get()!, updated);
      }
    } catch {
      // Silently fail
    }
  },

  checkAuth: async () => {
    if (!api.tokenManager.get()) {
      set({ currentUser: null, isLoggedIn: false });
      return;
    }
    set({ isLoading: true });
    try {
      const res: any = await api.get('/api/auth/me');
      if (res.code === 200 && res.data) {
        set({ currentUser: res.data, isLoggedIn: true });
        api.tokenManager.save(api.tokenManager.get()!, res.data);
      } else {
        api.tokenManager.clear();
        set({ currentUser: null, isLoggedIn: false });
      }
    } catch {
      api.tokenManager.clear();
      set({ currentUser: null, isLoggedIn: false });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchStats: async () => {
    set({ statsLoading: true });
    try {
      /* Mock 模式：直接返回模拟数据 */
      if (import.meta.env.VITE_USE_MOCK === 'true') {
        set({
          profileStats: {
            memoriesCount: 42,
            streakDays: 7,
          },
          statsLoading: false,
        });
        return;
      }
      const res: any = await api.get('/api/users/stats');
      if (res.code === 200 && res.data) {
        set({ profileStats: res.data });
      }
    } catch {
      // Silently fail
    } finally {
      set({ statsLoading: false });
    }
  },
}));
