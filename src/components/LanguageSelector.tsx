import { useLocale } from '../i18n/LocaleContext';
import type { AppLocale } from '../i18n/messages';

interface LanguageSelectorProps {
  disabled?: boolean;
}

export function LanguageSelector({ disabled }: LanguageSelectorProps) {
  const { locale, setLocale, t } = useLocale();

  const options: { value: AppLocale; label: string }[] = [
    { value: 'en-US', label: t.langEn },
    { value: 'pt-BR', label: t.langPt },
  ];

  return (
    <label className="block titlebar-no-drag">
      <span className="mb-1.5 block text-[13px] font-medium text-[var(--text-secondary)]">
        {t.language}
      </span>
      <div className="relative">
        <select
          value={locale}
          disabled={disabled}
          onChange={(event) => setLocale(event.target.value as AppLocale)}
          className="w-full appearance-none rounded-mac border border-[var(--control-border)] bg-[var(--control-bg)] px-4 py-3 pr-10 text-[15px] text-[var(--text-primary)] shadow-sm outline-none transition focus:border-accent/40 focus:bg-[var(--control-bg-hover)] focus:ring-2 focus:ring-accent/20 disabled:opacity-60"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[var(--text-muted)]">
          ▾
        </span>
      </div>
    </label>
  );
}
