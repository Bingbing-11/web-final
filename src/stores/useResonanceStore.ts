import { create } from 'zustand';
import * as api from '../lib/api';

export interface Resonance {
  id: string;
  worldId?: string;
  worldName?: string;
  authorId: string;
  authorName: string;
  emotion: string;
  emotionHue: number;
  content: string;
  keywords: string[];
  reactions: { userId: string; type: string }[];
  isAnonymous: boolean;
  createdAt: string;
}

interface ResonanceState {
  resonances: Resonance[];
  isLoading: boolean;
  fetchResonances: (params?: { worldId?: string; emotion?: string; limit?: number }) => Promise<void>;
  addResonance: (data: Omit<Resonance, 'id' | 'createdAt' | 'reactions'>) => Promise<Resonance | null>;
  removeResonance: (id: string) => Promise<void>;
  addReaction: (id: string, userId: string, type: string) => Promise<void>;
  getByWorld: (worldId: string) => Resonance[];
  getByEmotion: (emotion: string) => Resonance[];
  getRecent: (limit: number) => Resonance[];
  getMyResonances: (userId: string) => Resonance[];
}

export const useResonanceStore = create<ResonanceState>()((set, get) => ({
  resonances: [],
  isLoading: false,

  fetchResonances: async (params) => {
    set({ isLoading: true });
    try {
      const res: any = await api.get('/api/resonances', params || {});
      if (res.code === 200) {
        set({ resonances: res.data || [] });
      }
    } catch {
      // Silently fail
    } finally {
      set({ isLoading: false });
    }
  },

  addResonance: async (data) => {
    try {
      const res: any = await api.post('/api/resonances', data);
      if (res.code === 200 || res.code === 201) {
        const r: Resonance = res.data;
        set(s => ({ resonances: [r, ...s.resonances] }));
        return r;
      }
      return null;
    } catch {
      return null;
    }
  },

  removeResonance: async (id) => {
    try {
      await api.del(`/api/resonances/${id}`);
      set(s => ({ resonances: s.resonances.filter(r => r.id !== id) }));
    } catch {
      // Silently fail
    }
  },

  addReaction: async (id, userId, type) => {
    try {
      const res: any = await api.post(`/api/resonances/${id}/react`, { type });
      if (res.code === 200 && res.data) {
        set(s => ({
          resonances: s.resonances.map(r =>
            r.id === id ? { ...r, reactions: res.data } : r
          ),
        }));
      }
    } catch {
      // Silently fail
    }
  },

  getByWorld: (worldId) => get().resonances.filter(r => r.worldId === worldId),
  getByEmotion: (emotion) => get().resonances.filter(r => r.emotion === emotion),
  getRecent: (limit) => get().resonances.slice(0, limit),
  getMyResonances: (userId) => get().resonances.filter(r => r.authorId === userId && !r.isAnonymous),
}));
