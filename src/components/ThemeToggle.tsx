import type { Theme } from '../hooks/useTheme';
import { useLocale } from '../i18n/LocaleContext';

interface ThemeToggleProps {
  theme: Theme;
  onToggle: () => void;
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const { t } = useLocale();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isDark ? t.themeToLight : t.themeToDark}
      title={isDark ? t.lightMode : t.darkMode}
      className="titlebar-no-drag inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--control-border)] bg-[var(--control-bg)] text-[var(--text-primary)] shadow-sm backdrop-blur-md transition hover:bg-[var(--control-bg-hover)]"
    >
      {isDark ? (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
          <path
            d="M12 2v2.2M12 19.8V22M4.93 4.93l1.56 1.56M17.51 17.51l1.56 1.56M2 12h2.2M19.8 12H22M4.93 19.07l1.56-1.56M17.51 6.49l1.56-1.56"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M20.5 14.2A8.2 8.2 0 0 1 9.8 3.5 7.2 7.2 0 1 0 20.5 14.2Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}
