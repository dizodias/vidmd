import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useTypewriter } from '../hooks/useTypewriter';
import { useLocale } from '../i18n/LocaleContext';
import { vidmdClient } from '../platform/vidmdClient';

interface MarkdownOutputProps {
  markdown: string;
  isLoading: boolean;
}

export function MarkdownOutput({ markdown, isLoading }: MarkdownOutputProps) {
  const { t } = useLocale();
  const [copyLabel, setCopyLabel] = useState(t.copy);
  const [exportLabel, setExportLabel] = useState(t.exportMd);
  const [entered, setEntered] = useState(false);
  const hasSource = markdown.trim().length > 0;

  const { displayedText, isTyping } = useTypewriter({
    text: markdown,
    enabled: hasSource && !isLoading,
    durationMs: 2400,
  });

  useEffect(() => {
    setCopyLabel(t.copy);
    setExportLabel(t.exportMd);
  }, [t]);

  useEffect(() => {
    const id = window.requestAnimationFrame(() => setEntered(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  async function handleCopy(): Promise<void> {
    if (!hasSource || isTyping || isLoading) return;

    try {
      await navigator.clipboard.writeText(markdown);
      setCopyLabel(t.copied);
      window.setTimeout(() => setCopyLabel(t.copy), 1500);
    } catch {
      setCopyLabel(t.error);
      window.setTimeout(() => setCopyLabel(t.copy), 1500);
    }
  }

  async function handleExport(): Promise<void> {
    if (!hasSource || isTyping || isLoading) return;

    try {
      const result = await vidmdClient.exportMarkdown(markdown);
      if (result.ok) {
        setExportLabel(t.saved);
        window.setTimeout(() => setExportLabel(t.exportMd), 1500);
      }
    } catch {
      setExportLabel(t.error);
      window.setTimeout(() => setExportLabel(t.exportMd), 1500);
    }
  }

  const actionsDisabled = !hasSource || isLoading || isTyping;

  return (
    <section
      className={`result-panel relative flex min-h-0 flex-1 flex-col titlebar-no-drag ${
        entered ? 'result-panel--visible' : ''
      }`}
    >
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-[13px] font-medium text-[var(--text-secondary)]">
          {t.result}
        </h2>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden rounded-panel border border-[var(--glass-border)] bg-[var(--panel-bg)] shadow-glass backdrop-blur-xl">
        <div className="markdown-body h-full overflow-y-auto px-5 py-4 pb-16">
          {isLoading ? (
            <div className="flex h-full min-h-[220px] flex-col items-center justify-center gap-3 text-[var(--text-secondary)]">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent/20 border-t-accent" />
              <p className="text-sm">{t.processingVideo}</p>
            </div>
          ) : (
            <div className="typewriter-content">
              <ReactMarkdown>{displayedText}</ReactMarkdown>
              {isTyping ? (
                <span className="typewriter-caret" aria-hidden="true" />
              ) : null}
            </div>
          )}
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-end gap-2 p-3">
          <button
            type="button"
            disabled={actionsDisabled}
            onClick={() => void handleCopy()}
            className="pointer-events-auto rounded-full border border-[var(--float-border)] bg-[var(--float-bg)] px-3.5 py-1.5 text-[13px] font-medium text-[var(--text-primary)] shadow-float backdrop-blur-md transition hover:bg-[var(--float-bg-hover)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {copyLabel}
          </button>
          <button
            type="button"
            disabled={actionsDisabled}
            onClick={() => void handleExport()}
            className="pointer-events-auto rounded-full border border-[var(--float-border)] bg-[var(--float-bg)] px-3.5 py-1.5 text-[13px] font-medium text-[var(--text-primary)] shadow-float backdrop-blur-md transition hover:bg-[var(--float-bg-hover)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {exportLabel}
          </button>
        </div>
      </div>
    </section>
  );
}
