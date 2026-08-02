import { useLocale } from '../i18n/LocaleContext';

interface UrlInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function UrlInput({ value, onChange, disabled }: UrlInputProps) {
  const { t } = useLocale();

  return (
    <label className="block titlebar-no-drag">
      <span className="mb-1.5 block text-[13px] font-medium text-[var(--text-secondary)]">
        {t.youtubeUrl}
      </span>
      <input
        type="url"
        inputMode="url"
        placeholder="https://www.youtube.com/watch?v=..."
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-mac border border-[var(--control-border)] bg-[var(--control-bg)] px-4 py-3 text-[15px] text-[var(--text-primary)] shadow-sm outline-none transition placeholder:text-[var(--placeholder)] focus:border-accent/40 focus:bg-[var(--control-bg-hover)] focus:ring-2 focus:ring-accent/20 disabled:opacity-60"
      />
    </label>
  );
}
