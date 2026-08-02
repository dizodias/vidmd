import type {
  SummarizePayload,
  SummarizeResponse,
  VidmdApi,
} from '../types/global';

function isElectronRuntime(): boolean {
  return typeof window !== 'undefined' && typeof window.vidmd !== 'undefined';
}

async function summarizeViaHttp(
  payload: SummarizePayload,
): Promise<SummarizeResponse> {
  const response = await fetch('/api/summarize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => null)) as {
    markdown?: string;
    error?: string;
  } | null;

  if (!response.ok) {
    throw new Error(data?.error ?? 'Falha ao resumir o vídeo.');
  }

  if (!data?.markdown || typeof data.markdown !== 'string') {
    throw new Error('Resposta inválida da API de resumo.');
  }

  return { markdown: data.markdown };
}

function exportMarkdownViaDownload(
  markdown: string,
): Promise<{ ok: boolean; canceled?: boolean }> {
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = 'vidmd-summary.md';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
  return Promise.resolve({ ok: true });
}

function createWebClient(): VidmdApi {
  return {
    getVersion: async () => import.meta.env.VITE_APP_VERSION || '0.0.0',
    summarize: summarizeViaHttp,
    exportMarkdown: exportMarkdownViaDownload,
  };
}

export const vidmdClient: VidmdApi = {
  getVersion: () =>
    isElectronRuntime()
      ? window.vidmd!.getVersion()
      : createWebClient().getVersion(),
  summarize: (payload) =>
    isElectronRuntime()
      ? window.vidmd!.summarize(payload)
      : createWebClient().summarize(payload),
  exportMarkdown: (markdown) =>
    isElectronRuntime()
      ? window.vidmd!.exportMarkdown(markdown)
      : createWebClient().exportMarkdown(markdown),
};

export function isDesktopApp(): boolean {
  return isElectronRuntime();
}
