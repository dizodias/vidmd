export type AppLanguage = 'en-US' | 'pt-BR';

/** @deprecated Use AppLanguage */
export type OutputLanguage = AppLanguage;

export interface SummarizePayload {
  url: string;
  language: AppLanguage;
}

export interface SummarizeResponse {
  markdown: string;
}

export interface VidmdApi {
  getVersion: () => Promise<string>;
  summarize: (payload: SummarizePayload) => Promise<SummarizeResponse>;
  exportMarkdown: (
    markdown: string,
  ) => Promise<{ ok: boolean; canceled?: boolean }>;
}

declare global {
  interface Window {
    vidmd?: VidmdApi;
  }
}

export {};
