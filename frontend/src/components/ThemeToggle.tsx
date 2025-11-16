import { useThemeStore } from '../store/themeStore';

export default function ThemeToggle() {
  const { mode, toggleTheme } = useThemeStore();

  const getLabel = () => {
    switch (mode) {
      case 'light':
        return 'Mode clair - Cliquer pour mode sombre';
      case 'dark':
        return 'Mode sombre - Cliquer pour mode auto';
      case 'auto':
        return 'Mode auto (20h-7h sombre) - Cliquer pour mode clair';
    }
  };

  const getIcon = () => {
    switch (mode) {
      case 'light':
        return (
          // Icône Soleil
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        );
      case 'dark':
        return (
          // Icône Lune
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
        );
      case 'auto':
        return (
          // Icône Auto (soleil + lune)
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m3.343-5.657l-.707-.707m12.728 0l-.707.707"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.5 12a5.5 5.5 0 01-5.5 5.5"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 9.5a3 3 0 00-3-3"
            />
          </svg>
        );
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-200 text-white/90"
      aria-label={getLabel()}
      title={getLabel()}
    >
      {getIcon()}
      <span className="text-xs font-medium uppercase tracking-wide">
        {mode === 'auto' ? 'Auto' : mode === 'light' ? 'Clair' : 'Sombre'}
      </span>
    </button>
  );
}
