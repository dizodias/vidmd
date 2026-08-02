import { toCanonicalYoutubeWatchUrl } from './youtube.js';

export type AppLanguage = 'en-US' | 'pt-BR';

/** @deprecated Use AppLanguage — kept as alias for API compatibility. */
export type OutputLanguage = AppLanguage;

export interface SummarizeRequest {
  url: string;
  language: AppLanguage;
}

export interface SummarizeResult {
  markdown: string;
}

export function parseAppLanguage(value: unknown): AppLanguage {
  return value === 'pt-BR' ? 'pt-BR' : 'en-US';
}

export type ApiErrorKey =
  | 'invalidUrl'
  | 'invalidYoutube'
  | 'summarizeFailed'
  | 'methodNotAllowed'
  | 'invalidResponse'
  | 'missingApiKey'
  | 'privateOrUnavailableVideo'
  | 'quotaExceeded';

export function apiErrorMessage(
  language: AppLanguage,
  key: ApiErrorKey,
): string {
  const en: Record<ApiErrorKey, string> = {
    invalidUrl: 'Invalid URL.',
    invalidYoutube: 'Enter a valid YouTube URL.',
    summarizeFailed: 'Failed to summarize the video.',
    methodNotAllowed: 'Method not allowed.',
    invalidResponse: 'Invalid summary API response.',
    missingApiKey:
      'GEMINI_API_KEY is not configured. Add a free key from Google AI Studio.',
    privateOrUnavailableVideo:
      'This video is private, unlisted, or unavailable for summarization.',
    quotaExceeded:
      'Gemini free-tier quota exceeded. Try again later or check AI Studio limits.',
  };
  const pt: Record<ApiErrorKey, string> = {
    invalidUrl: 'URL inválida.',
    invalidYoutube: 'Informe um URL válido do YouTube.',
    summarizeFailed: 'Falha ao resumir o vídeo.',
    methodNotAllowed: 'Método não permitido.',
    invalidResponse: 'Resposta inválida da API de resumo.',
    missingApiKey:
      'GEMINI_API_KEY não configurada. Adicione uma chave gratuita do Google AI Studio.',
    privateOrUnavailableVideo:
      'Este vídeo é privado, não listado ou indisponível para resumo.',
    quotaExceeded:
      'Cota gratuita do Gemini esgotada. Tente mais tarde ou confira os limites no AI Studio.',
  };

  return (language === 'pt-BR' ? pt : en)[key];
}

const DEFAULT_GEMINI_MODEL = 'gemini-2.0-flash';

interface GeminiGenerateResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
  error?: {
    code?: number;
    message?: string;
    status?: string;
  };
}

function buildSummaryPrompt(language: AppLanguage, sourceUrl: string): string {
  if (language === 'pt-BR') {
    return [
      'Analise o vídeo do YouTube fornecido e escreva um resumo claro em Markdown.',
      'Use exatamente este idioma: Português (Brasil).',
      'Estruture a resposta assim:',
      '# Resumo do Vídeo',
      `**Fonte:** ${sourceUrl}`,
      '## Visão geral',
      '(2–4 frases)',
      '## Pontos principais',
      '(lista com bullets)',
      '## Conclusões',
      '(breves conclusões ou takeaways)',
      'Não invente fatos que não estejam no vídeo. Não inclua prefácio fora do Markdown.',
    ].join('\n');
  }

  return [
    'Analyze the provided YouTube video and write a clear Markdown summary.',
    'Use exactly this language: English (US).',
    'Structure the response like this:',
    '# Video Summary',
    `**Source:** ${sourceUrl}`,
    '## Overview',
    '(2–4 sentences)',
    '## Key Points',
    '(bullet list)',
    '## Takeaways',
    '(short conclusions)',
    'Do not invent facts that are not in the video. Do not include a preface outside the Markdown.',
  ].join('\n');
}

function mapGeminiFailure(
  language: AppLanguage,
  status: number,
  body: GeminiGenerateResponse,
): Error {
  const raw = `${body.error?.status ?? ''} ${body.error?.message ?? ''}`.toLowerCase();

  if (
    status === 429 ||
    raw.includes('resource_exhausted') ||
    raw.includes('quota') ||
    raw.includes('rate limit')
  ) {
    return new Error(apiErrorMessage(language, 'quotaExceeded'));
  }

  if (
    status === 403 ||
    status === 404 ||
    raw.includes('not found') ||
    raw.includes('permission') ||
    raw.includes('private') ||
    raw.includes('unlisted') ||
    raw.includes('unavailable') ||
    raw.includes('failed to fetch') ||
    raw.includes('youtube')
  ) {
    return new Error(apiErrorMessage(language, 'privateOrUnavailableVideo'));
  }

  return new Error(apiErrorMessage(language, 'summarizeFailed'));
}

/**
 * Summarizes a public YouTube video via Gemini Free Tier (YouTube URL fileUri).
 */
export async function summarizeVideo(
  request: SummarizeRequest,
): Promise<SummarizeResult> {
  const language = parseAppLanguage(request.language);
  const canonicalUrl = toCanonicalYoutubeWatchUrl(request.url);

  if (!canonicalUrl) {
    throw new Error(apiErrorMessage(language, 'invalidYoutube'));
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(apiErrorMessage(language, 'missingApiKey'));
  }

  const model =
    process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              {
                fileData: {
                  fileUri: canonicalUrl,
                },
              },
              {
                text: buildSummaryPrompt(language, canonicalUrl),
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 4096,
        },
      }),
    });
  } catch {
    throw new Error(apiErrorMessage(language, 'summarizeFailed'));
  }

  const body = (await response.json().catch(() => ({}))) as GeminiGenerateResponse;

  if (!response.ok || body.error) {
    throw mapGeminiFailure(language, response.status, body);
  }

  const markdown = body.candidates?.[0]?.content?.parts
    ?.map((part) => part.text ?? '')
    .join('')
    .trim();

  if (!markdown) {
    throw new Error(apiErrorMessage(language, 'summarizeFailed'));
  }

  return { markdown };
}
