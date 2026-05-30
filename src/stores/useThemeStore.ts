import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  theme: 'light' | 'dark';
  nightMode: boolean;
  nightModeStart: number;
  nightModeEnd: number;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleNightMode: () => void;
  setNightModeSchedule: (start: number, end: number) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light',
      nightMode: false,
      nightModeStart: 22,
      nightModeEnd: 6,
      setTheme: (theme) => set({ theme }),
      toggleNightMode: () => set(s => ({ nightMode: !s.nightMode })),
      setNightModeSchedule: (start, end) => set({ nightModeStart: start, nightModeEnd: end }),
    }),
    { name: 'pw_theme' }
  )
);
