import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/globals.css';
import './styles/animations.css';
import { useThemeSync } from './hooks/useThemeSync';
import App from './App';

function ThemeSyncWrapper() {
  useThemeSync();
  return null;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeSyncWrapper />
    <App />
  </StrictMode>
);
