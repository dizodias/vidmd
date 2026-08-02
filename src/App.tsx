import { useEffect, useState } from 'react';
import { Footer } from './components/Footer';
import { LanguageSelector } from './components/LanguageSelector';
import { MarkdownOutput } from './components/MarkdownOutput';
import { ThemeToggle } from './components/ThemeToggle';
import { UrlInput } from './components/UrlInput';
import { isLikelyYoutubeUrl } from './core/youtube';
import { useTheme } from './hooks/useTheme';
import { useLocale } from './i18n/LocaleContext';
import { vidmdClient } from './platform/vidmdClient';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const { locale, t } = useLocale();
  const [url, setUrl] = useState('');
  const [markdown, setMarkdown] = useState('');
  const [hasSummarized, setHasSummarized] = useState(false);
  const [resultKey, setResultKey] = useState(0);
  const [version, setVersion] = useState(
    () => import.meta.env.VITE_APP_VERSION || '1.0.0',
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadVersion(): Promise<void> {
      try {
        const value = await vidmdClient.getVersion();
        if (active && value) setVersion(value);
      } catch {
        // Keep fallback version from state.
      }
    }

    void loadVersion();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setError(null);
  }, [locale]);

  async function handleSummarize(): Promise<void> {
    setError(null);

    if (!url.trim()) {
      setError(t.errorEmptyUrl);
      return;
    }

    if (!isLikelyYoutubeUrl(url)) {
      setError(t.errorInvalidUrl);
      return;
    }

    setIsLoading(true);

    try {
      const result = await vidmdClient.summarize({
        url: url.trim(),
        language: locale,
      });
      setMarkdown(result.markdown);
      setHasSummarized(true);
      setResultKey((current) => current + 1);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t.errorSummarizeFailed;
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex h-full flex-col px-5 pb-4 pt-10 sm:px-7">
      <header className="titlebar-drag mb-5 flex items-start justify-between gap-4">
        <div className="titlebar-no-drag inline-block">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-[var(--text-muted)]">
            {t.brandTag}
          </p>
          <h1 className="mt-1 text-[22px] font-semibold tracking-tight text-[var(--text-primary)]">
            {t.headline}
          </h1>
        </div>
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
      </header>

      <main className="mx-auto flex w-full max-w-3xl min-h-0 flex-1 flex-col gap-4">
        <div className="rounded-panel border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4 shadow-glass backdrop-blur-xl sm:p-5">
          <div className="grid gap-3 sm:grid-cols-[1fr_220px] sm:items-end">
            <UrlInput value={url} onChange={setUrl} disabled={isLoading} />
            <LanguageSelector disabled={isLoading} />
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => void handleSummarize()}
              className="titlebar-no-drag inline-flex items-center justify-center rounded-mac bg-accent px-5 py-3 text-[15px] font-semibold text-white shadow-sm transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? t.summarizing : t.summarize}
            </button>
            {isLoading && !hasSummarized ? (
              <div className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent/20 border-t-accent" />
                {t.preparingSummary}
              </div>
            ) : null}
            {error ? (
              <p
                className="text-sm"
                style={{ color: 'var(--error)' }}
                role="alert"
              >
                {error}
              </p>
            ) : null}
          </div>
        </div>

        {hasSummarized ? (
          <MarkdownOutput
            key={resultKey}
            markdown={markdown}
            isLoading={isLoading}
          />
        ) : null}

        <Footer version={version} />
      </main>
    </div>
  );
}
