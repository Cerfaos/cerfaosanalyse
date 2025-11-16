import { useEffect } from 'react';
import { useThemeStore, getThemeForTime } from '../store/themeStore';

export function useTheme() {
  const { theme, mode, setMode } = useThemeStore();

  useEffect(() => {
    // Appliquer le thème au chargement initial
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Vérifier périodiquement si on est en mode auto
  useEffect(() => {
    if (mode !== 'auto') return;

    // Vérifier toutes les minutes si le thème doit changer
    const checkTheme = () => {
      const newTheme = getThemeForTime();
      if (newTheme !== theme) {
        setMode('auto'); // Cela recalculera le thème
      }
    };

    const interval = setInterval(checkTheme, 60000); // Vérifier toutes les minutes
    return () => clearInterval(interval);
  }, [mode, theme, setMode]);

  return { theme, mode };
}
