import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  apiErrorMessage,
  parseAppLanguage,
  summarizeVideo,
  type SummarizeRequest,
} from '../src/core/summarize';
import { isLikelyYoutubeUrl } from '../src/core/youtube';

function setCorsHeaders(res: VercelResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  setCorsHeaders(res);

  const body = (req.body ?? {}) as Partial<SummarizeRequest>;
  const language = parseAppLanguage(body.language);

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: apiErrorMessage(language, 'methodNotAllowed') });
    return;
  }

  const url = typeof body.url === 'string' ? body.url.trim() : '';

  if (!url) {
    res.status(400).json({ error: apiErrorMessage(language, 'invalidUrl') });
    return;
  }

  if (!isLikelyYoutubeUrl(url)) {
    res.status(400).json({ error: apiErrorMessage(language, 'invalidYoutube') });
    return;
  }

  try {
    const result = await summarizeVideo({ url, language });
    res.status(200).json(result);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : apiErrorMessage(language, 'summarizeFailed');
    res.status(500).json({ error: message });
  }
}
