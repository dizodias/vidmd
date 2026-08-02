import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  DEFAULT_LOCALE,
  isAppLocale,
  messagesByLocale,
  type AppLocale,
  type Messages,
} from './messages';

const STORAGE_KEY = 'vidmd-locale';
const FADE_OUT_MS = 120;

interface LocaleContextValue {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
  t: Messages;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

function readStoredLocale(): AppLocale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored && isAppLocale(stored)) return stored;
  return DEFAULT_LOCALE;
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<AppLocale>(() => readStoredLocale());
  const [isFading, setIsFading] = useState(false);
  const localeRef = useRef(locale);
  const timerRef = useRef<number | null>(null);
  localeRef.current = locale;

  const setLocale = useCallback((next: AppLocale) => {
    if (next === localeRef.current) return;

    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    if (prefersReducedMotion) {
      setIsFading(false);
      setLocaleState(next);
      return;
    }

    setIsFading(true);

    timerRef.current = window.setTimeout(() => {
      setLocaleState(next);
      window.requestAnimationFrame(() => {
        setIsFading(false);
      });
      timerRef.current = null;
    }, FADE_OUT_MS);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, locale);
    document.documentElement.lang = locale === 'pt-BR' ? 'pt-BR' : 'en';
  }, [locale]);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
      t: messagesByLocale[locale],
    }),
    [locale, setLocale],
  );

  return (
    <LocaleContext.Provider value={value}>
      <div
        className={`locale-shell${isFading ? ' locale-shell--fading' : ''}`}
      >
        {children}
      </div>
    </LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within LocaleProvider');
  }
  return context;
}
