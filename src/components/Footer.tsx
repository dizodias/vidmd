interface FooterProps {
  version: string;
}

export function Footer({ version }: FooterProps) {
  return (
    <footer className="titlebar-no-drag pt-3 text-center text-[11px] tracking-wide text-[var(--text-muted)]">
      Vid.md v{version}
      <span className="mx-1.5 opacity-50" aria-hidden="true">
        ·
      </span>
      <a
        href="https://dizodias.com"
        target="_blank"
        rel="noopener noreferrer"
        className="text-inherit no-underline transition-opacity hover:opacity-80"
      >
        dizodias
      </a>
    </footer>
  );
}
