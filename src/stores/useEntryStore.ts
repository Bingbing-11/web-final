import { create } from 'zustand';
import type { Entry } from '../types/entry';
import * as api from '../lib/api';

interface EntryState {
  entries: Entry[];
  isLoading: boolean;
  fetchEntries: (worldId: string) => Promise<void>;
  addEntry: (entry: Omit<Entry, 'id' | 'createdAt' | 'updatedAt' | 'readCount'>) => Promise<Entry | null>;
  updateEntry: (id: string, updates: Partial<Entry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  burnEntry: (id: string) => Promise<void>;
  getEntriesByWorld: (worldId: string) => Entry[];
  getEntry: (id: string) => Entry | undefined;
}

export const useEntryStore = create<EntryState>()((set, get) => ({
  entries: [],
  isLoading: false,

  fetchEntries: async (worldId: string) => {
    set({ isLoading: true });
    try {
      const res: any = await api.get('/api/entries', { worldId });
      if (res.code === 200) {
        set({ entries: res.data || [] });
      }
    } catch {
      // Silently fail
    } finally {
      set({ isLoading: false });
    }
  },

  addEntry: async (data) => {
    try {
      const res: any = await api.post('/api/entries', data);
      if (res.code === 200 || res.code === 201) {
        const entry: Entry = res.data;
        set(s => ({ entries: [entry, ...s.entries] }));
        return entry;
      }
      return null;
    } catch {
      return null;
    }
  },

  updateEntry: async (id, updates) => {
    try {
      await api.put(`/api/entries/${id}`, updates);
      set(s => ({
        entries: s.entries.map(e => e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e),
      }));
    } catch {
      // Silently fail
    }
  },

  deleteEntry: async (id) => {
    try {
      await api.del(`/api/entries/${id}`);
      set(s => ({ entries: s.entries.filter(e => e.id !== id) }));
    } catch {
      // Silently fail
    }
  },

  burnEntry: async (id) => {
    try {
      await api.patch(`/api/entries/${id}/burn`);
      set(s => ({
        entries: s.entries.map(e => e.id === id ? { ...e, status: 'burned' as const, burnedAt: new Date().toISOString() } : e),
      }));
    } catch {
      // Silently fail
    }
  },

  getEntriesByWorld: (worldId) => get().entries.filter(e => e.worldId === worldId),
  getEntry: (id) => get().entries.find(e => e.id === id),
}));
