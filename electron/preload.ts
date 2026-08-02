import { contextBridge, ipcRenderer } from 'electron';

export type AppLanguage = 'en-US' | 'pt-BR';

export interface SummarizePayload {
  url: string;
  language: AppLanguage;
}

export interface SummarizeResponse {
  markdown: string;
}

const api = {
  getVersion: (): Promise<string> => ipcRenderer.invoke('app:get-version'),
  summarize: (payload: SummarizePayload): Promise<SummarizeResponse> =>
    ipcRenderer.invoke('summary:request', payload),
  exportMarkdown: (
    markdown: string,
  ): Promise<{ ok: boolean; canceled?: boolean }> =>
    ipcRenderer.invoke('markdown:export', markdown),
};

contextBridge.exposeInMainWorld('vidmd', api);
