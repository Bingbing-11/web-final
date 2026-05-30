import { useEffect } from 'react';
import { useThemeStore } from '../stores/useThemeStore';
import { useNightMode } from './useNightMode';

export function useThemeSync() {
  const { theme } = useThemeStore();
  const isNight = useNightMode();

  useEffect(() => {
    const dataTheme = isNight ? 'night' : theme;
    document.documentElement.setAttribute('data-theme', dataTheme);
  }, [theme, isNight]);
}
