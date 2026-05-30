import { create } from 'zustand';
import type { World } from '../types/world';
import * as api from '../lib/api';

interface WorldState {
  worlds: World[];
  isLoading: boolean;
  fetchWorlds: () => Promise<void>;
  createWorld: (data: Omit<World, 'id' | 'createdAt' | 'updatedAt' | 'entryCount' | 'permissions'>) => Promise<World | null>;
  updateWorld: (id: string, updates: Partial<World>) => Promise<void>;
  deleteWorld: (id: string) => Promise<void>;
  sealWorld: (id: string) => Promise<void>;
  unsealWorld: (id: string) => Promise<void>;
  getWorld: (id: string) => World | undefined;
}

export const useWorldStore = create<WorldState>()((set, get) => ({
  worlds: [],
  isLoading: false,

  fetchWorlds: async () => {
    set({ isLoading: true });
    try {
      const res: any = await api.get('/api/worlds');
      if (res.code === 200) {
        set({ worlds: res.data || [] });
      }
    } catch {
      // Silently fail
    } finally {
      set({ isLoading: false });
    }
  },

  createWorld: async (data) => {
    try {
      const res: any = await api.post('/api/worlds', {
        name: data.name,
        description: data.description,
        icon: data.icon,
        color: data.color,
      });
      if (res.code === 200 || res.code === 201) {
        const world: World = {
          ...res.data,
          createdAt: res.data.createdAt,
          updatedAt: res.data.updatedAt,
        };
        set(s => ({ worlds: [world, ...s.worlds] }));
        return world;
      }
      return null;
    } catch {
      return null;
    }
  },

  updateWorld: async (id, updates) => {
    try {
      await api.put(`/api/worlds/${id}`, updates);
      set(s => ({
        worlds: s.worlds.map(w => w.id === id ? { ...w, ...updates, updatedAt: new Date().toISOString() } : w),
      }));
    } catch {
      // Silently fail
    }
  },

  deleteWorld: async (id) => {
    try {
      await api.del(`/api/worlds/${id}`);
      set(s => ({ worlds: s.worlds.filter(w => w.id !== id) }));
    } catch {
      // Silently fail
    }
  },

  sealWorld: async (id) => {
    try {
      await api.patch(`/api/worlds/${id}/seal`, { seal: true });
      set(s => ({
        worlds: s.worlds.map(w => w.id === id ? { ...w, isSealed: true, sealedAt: new Date().toISOString() } : w),
      }));
    } catch {
      // Silently fail
    }
  },

  unsealWorld: async (id) => {
    try {
      await api.patch(`/api/worlds/${id}/seal`, { seal: false });
      set(s => ({
        worlds: s.worlds.map(w => w.id === id ? { ...w, isSealed: false, sealedAt: undefined } : w),
      }));
    } catch {
      // Silently fail
    }
  },

  getWorld: (id) => get().worlds.find(w => w.id === id),
}));
