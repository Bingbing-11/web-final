import { useEffect, useState } from 'react';
import { useThemeStore } from '../stores/useThemeStore';

export function useNightMode() {
  const { nightMode, nightModeStart, nightModeEnd } = useThemeStore();
  const [isNight, setIsNight] = useState(false);

  useEffect(() => {
    if (!nightMode) { setIsNight(false); return; }
    const check = () => {
      const h = new Date().getHours();
      const inRange = nightModeStart > nightModeEnd
        ? h >= nightModeStart || h < nightModeEnd
        : h >= nightModeStart && h < nightModeEnd;
      setIsNight(inRange);
    };
    check();
    const timer = setInterval(check, 60000);
    return () => clearInterval(timer);
  }, [nightMode, nightModeStart, nightModeEnd]);

  return isNight;
}
