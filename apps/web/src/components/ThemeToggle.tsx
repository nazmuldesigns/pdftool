import React, { useEffect, useState } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

type ThemeMode = 'light' | 'dark' | 'system';

export const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('theme-preference') as ThemeMode;
      return saved === 'light' || saved === 'dark' || saved === 'system' ? saved : 'system';
    } catch {
      return 'system';
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = (currentTheme: ThemeMode) => {
      let resolvedTheme: 'light' | 'dark';
      if (currentTheme === 'system') {
        resolvedTheme = mediaQuery.matches ? 'dark' : 'light';
      } else {
        resolvedTheme = currentTheme;
      }
      root.setAttribute('data-theme', resolvedTheme);
      try {
        localStorage.setItem('theme-preference', currentTheme);
      } catch {}
    };

    applyTheme(theme);

    const listener = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, [theme]);

  const toggleNext = () => {
    if (theme === 'system') setTheme('light');
    else if (theme === 'light') setTheme('dark');
    else setTheme('system');
  };

  return (
    <button
      onClick={toggleNext}
      className="btn-icon"
      title={`Current Theme: ${theme.toUpperCase()} (Click to toggle)`}
      aria-label="Toggle theme color scheme"
    >
      {theme === 'light' && <Sun size={19} />}
      {theme === 'dark' && <Moon size={19} />}
      {theme === 'system' && <Monitor size={19} />}
    </button>
  );
};
