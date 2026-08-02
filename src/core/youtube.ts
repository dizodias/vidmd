const YOUTUBE_HOSTS = new Set([
  'youtube.com',
  'm.youtube.com',
  'youtu.be',
  'music.youtube.com',
]);

/** YouTube video IDs are 11 characters from this alphabet. */
const VIDEO_ID_PATTERN = /^[\w-]{11}$/;

/**
 * Extracts an 11-character YouTube video id from common URL shapes.
 */
export function extractYoutubeVideoId(value: string): string | null {
  try {
    const url = new URL(value.trim());
    const host = url.hostname.replace(/^www\./, '');

    if (!YOUTUBE_HOSTS.has(host)) {
      return null;
    }

    if (host === 'youtu.be') {
      const id = url.pathname.split('/').filter(Boolean)[0] ?? '';
      return VIDEO_ID_PATTERN.test(id) ? id : null;
    }

    const fromQuery = url.searchParams.get('v');
    if (fromQuery && VIDEO_ID_PATTERN.test(fromQuery)) {
      return fromQuery;
    }

    const segments = url.pathname.split('/').filter(Boolean);
    const markerIndex = segments.findIndex((segment) =>
      ['shorts', 'embed', 'live', 'v'].includes(segment),
    );

    if (markerIndex >= 0) {
      const id = segments[markerIndex + 1] ?? '';
      return VIDEO_ID_PATTERN.test(id) ? id : null;
    }

    return null;
  } catch {
    return null;
  }
}

export function isLikelyYoutubeUrl(value: string): boolean {
  return extractYoutubeVideoId(value) !== null;
}

/** Canonical watch URL used for Gemini fileUri. */
export function toCanonicalYoutubeWatchUrl(value: string): string | null {
  const videoId = extractYoutubeVideoId(value);
  if (!videoId) {
    return null;
  }

  return `https://www.youtube.com/watch?v=${videoId}`;
}
