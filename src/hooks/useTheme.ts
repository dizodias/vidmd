import { useEffect, useRef, useState } from 'react';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'vidmd-theme';
const TRANSITION_CLASS = 'theme-animating';
const TRANSITION_MS = 450;

function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

export function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light';

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;

  return getSystemTheme();
}

function applyThemeClass(theme: Theme): void {
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.style.colorScheme = theme;
}

export function applyTheme(theme: Theme, animate = true): void {
  const root = document.documentElement;
  const run = () => applyThemeClass(theme);

  if (!animate) {
    run();
    return;
  }

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches;

  if (prefersReducedMotion) {
    run();
    return;
  }

  const doc = document as Document & {
    startViewTransition?: (update: () => void) => { finished: Promise<void> };
  };

  if (typeof doc.startViewTransition === 'function') {
    doc.startViewTransition(run);
    return;
  }

  root.classList.add(TRANSITION_CLASS);
  run();
  window.setTimeout(() => {
    root.classList.remove(TRANSITION_CLASS);
  }, TRANSITION_MS);
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => getInitialTheme());
  const isFirstRender = useRef(true);

  useEffect(() => {
    applyTheme(theme, !isFirstRender.current);
    window.localStorage.setItem(STORAGE_KEY, theme);
    isFirstRender.current = false;
  }, [theme]);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');

    const onChange = () => {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') return;
      const next = media.matches ? 'dark' : 'light';
      setThemeState(next);
    };

    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  function setTheme(next: Theme): void {
    setThemeState(next);
  }

  function toggleTheme(): void {
    setThemeState((current) => (current === 'dark' ? 'light' : 'dark'));
  }

  return { theme, setTheme, toggleTheme, isDark: theme === 'dark' };
}
