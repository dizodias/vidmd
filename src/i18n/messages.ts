export type AppLocale = 'en-US' | 'pt-BR';

export interface Messages {
  brandTag: string;
  headline: string;
  youtubeUrl: string;
  language: string;
  summarize: string;
  summarizing: string;
  preparingSummary: string;
  errorEmptyUrl: string;
  errorInvalidUrl: string;
  errorSummarizeFailed: string;
  errorInvalidResponse: string;
  result: string;
  processingVideo: string;
  copy: string;
  copied: string;
  exportMd: string;
  saved: string;
  error: string;
  themeToLight: string;
  themeToDark: string;
  lightMode: string;
  darkMode: string;
  langEn: string;
  langPt: string;
}

const enUS: Messages = {
  brandTag: 'Vid.md',
  headline: 'Video summaries in Markdown',
  youtubeUrl: 'YouTube URL',
  language: 'Language',
  summarize: 'Summarize Video',
  summarizing: 'Summarizing…',
  preparingSummary: 'Preparing summary…',
  errorEmptyUrl: 'Paste a YouTube URL to continue.',
  errorInvalidUrl: 'Enter a valid YouTube URL.',
  errorSummarizeFailed: 'Failed to summarize the video.',
  errorInvalidResponse: 'Invalid summary API response.',
  result: 'Result',
  processingVideo: 'Processing video…',
  copy: 'Copy',
  copied: 'Copied',
  exportMd: 'Export .md',
  saved: 'Saved',
  error: 'Error',
  themeToLight: 'Switch to light mode',
  themeToDark: 'Switch to dark mode',
  lightMode: 'Light mode',
  darkMode: 'Dark mode',
  langEn: 'English (US)',
  langPt: 'Portuguese (Brazil)',
};

const ptBR: Messages = {
  brandTag: 'Vid.md',
  headline: 'Resumo de vídeos em Markdown',
  youtubeUrl: 'URL do YouTube',
  language: 'Idioma',
  summarize: 'Resumir Vídeo',
  summarizing: 'Resumindo…',
  preparingSummary: 'Preparando resumo…',
  errorEmptyUrl: 'Cole um URL do YouTube para continuar.',
  errorInvalidUrl: 'Informe um URL válido do YouTube.',
  errorSummarizeFailed: 'Falha ao resumir o vídeo.',
  errorInvalidResponse: 'Resposta inválida da API de resumo.',
  result: 'Resultado',
  processingVideo: 'Processando vídeo…',
  copy: 'Copiar',
  copied: 'Copiado',
  exportMd: 'Exportar .md',
  saved: 'Salvo',
  error: 'Erro',
  themeToLight: 'Ativar modo claro',
  themeToDark: 'Ativar modo escuro',
  lightMode: 'Modo claro',
  darkMode: 'Modo escuro',
  langEn: 'English (US)',
  langPt: 'Português (Brasil)',
};

export const messagesByLocale: Record<AppLocale, Messages> = {
  'en-US': enUS,
  'pt-BR': ptBR,
};

export const DEFAULT_LOCALE: AppLocale = 'en-US';

export function isAppLocale(value: string): value is AppLocale {
  return value === 'en-US' || value === 'pt-BR';
}
