import { create } from 'zustand';
import type { User, UserSettings } from '../types/user';
import * as api from '../lib/api';
import { USE_MOCK } from '../config/env';

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

/**
 * 演示用户的默认偏好设置
 * 与 UserSettings 契约保持一致，避免 mock 用户因缺字段而类型不完整
 */
const MOCK_USER_SETTINGS: UserSettings = {
  theme: 'auto',
  nightMode: false,
  nightModeStart: 22,
  nightModeEnd: 6,
  language: 'zh-CN',
};

export const useAuthStore = create<AuthState>()((set, get) => ({
  currentUser: api.tokenManager.getUser(),
  isLoggedIn: !!api.tokenManager.get(),
  isLoading: false,
  profileStats: null,
  statsLoading: false,

  login: async (username: string, password: string) => {
    try {
      /* Mock 模式：任意账号密码均可登录，返回模拟用户 */
      if (USE_MOCK) {
        const mockUser = {
          id: 'mock-001',
          username,
          nickname: '水晶球旅者',
          avatar: undefined,
          bio: '在水晶球世界里探索中…',
          createdAt: new Date().toISOString(),
          settings: { ...MOCK_USER_SETTINGS },
        };
        const mockToken = 'mock-token-' + Date.now();
        api.tokenManager.save(mockToken, mockUser);
        set({ currentUser: mockUser, isLoggedIn: true });
        return true;
      }
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
      /* Mock 模式：直接注册成功 */
      if (USE_MOCK) {
        const mockUser = {
          id: 'mock-002',
          username,
          nickname: nickname || '水晶球旅者',
          avatar: undefined,
          bio: '',
          createdAt: new Date().toISOString(),
          settings: { ...MOCK_USER_SETTINGS },
        };
        const mockToken = 'mock-token-' + Date.now();
        api.tokenManager.save(mockToken, mockUser);
        set({ currentUser: mockUser, isLoggedIn: true });
        return { ok: true };
      }
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
    const token = api.tokenManager.get();
    if (!token) {
      set({ currentUser: null, isLoggedIn: false });
      return;
    }
    /* Mock 模式：token 存在则直接恢复用户 */
    if (USE_MOCK) {
      const user = api.tokenManager.getUser();
      if (user) {
        set({ currentUser: user, isLoggedIn: true });
      } else {
        api.tokenManager.clear();
        set({ currentUser: null, isLoggedIn: false });
      }
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
      if (USE_MOCK) {
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
