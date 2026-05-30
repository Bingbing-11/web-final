import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CrystalParams, SceneWeights } from '../types/crystal';
import { DEFAULT_CRYSTAL_PARAMS } from '../lib/crystal/materialEngine';

interface CrystalState {
  params: CrystalParams;
  cache: Record<string, CrystalParams>;
  updateParams: (updates: Partial<CrystalParams>) => void;
  updateCache: (worldId: string, params: CrystalParams) => void;
  getCached: (worldId: string) => CrystalParams | null;
}

export const useCrystalStore = create<CrystalState>()(
  persist(
    (set, get) => ({
      params: { ...DEFAULT_CRYSTAL_PARAMS },
      cache: {},
      updateParams: (updates) => set(s => ({ params: { ...s.params, ...updates } })),
      updateCache: (worldId, params) => set(s => ({
        cache: { ...s.cache, [worldId]: params },
      })),
      getCached: (worldId) => get().cache[worldId] || null,
    }),
    { name: 'pw_crystal' }
  )
);
