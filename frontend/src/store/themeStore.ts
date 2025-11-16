import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ThemeMode = 'light' | 'dark' | 'auto';
type Theme = 'light' | 'dark';

interface ThemeState {
  mode: ThemeMode;
  theme: Theme;
  toggleTheme: () => void;
  setMode: (mode: ThemeMode) => void;
  setTheme: (theme: Theme) => void;
}

function getThemeForTime(): Theme {
  const hour = new Date().getHours();
  // Mode sombre de 20h à 7h
  return hour >= 20 || hour < 7 ? 'dark' : 'light';
}

function applyTheme(theme: Theme) {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'light',
      theme: 'light',
      toggleTheme: () =>
        set((state) => {
          // Cycle: light -> dark -> auto -> light
          const modes: ThemeMode[] = ['light', 'dark', 'auto'];
          const currentIndex = modes.indexOf(state.mode);
          const newMode = modes[(currentIndex + 1) % modes.length];
          const newTheme = newMode === 'auto' ? getThemeForTime() : newMode;
          applyTheme(newTheme);
          return { mode: newMode, theme: newTheme };
        }),
      setMode: (mode: ThemeMode) =>
        set(() => {
          const newTheme = mode === 'auto' ? getThemeForTime() : mode;
          applyTheme(newTheme);
          return { mode, theme: newTheme };
        }),
      setTheme: (theme: Theme) =>
        set(() => {
          applyTheme(theme);
          return { theme, mode: theme };
        }),
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (state) => {
        // Après rehydratation, appliquer le thème correct
        if (state) {
          const theme = state.mode === 'auto' ? getThemeForTime() : state.mode;
          applyTheme(theme);
          state.theme = theme;
        }
      },
    }
  )
);

export { getThemeForTime };
