import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Plugin } from 'vite';
import {
  apiErrorMessage,
  parseAppLanguage,
  summarizeVideo,
} from './src/core/summarize';
import { isLikelyYoutubeUrl } from './src/core/youtube';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function applyServerEnv(mode: string): void {
  const env = loadEnv(mode, __dirname, '');
  for (const key of ['GEMINI_API_KEY', 'GEMINI_MODEL', 'VIDMD_API_URL'] as const) {
    if (env[key] && !process.env[key]) {
      process.env[key] = env[key];
    }
  }
}

function readJsonBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    req.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });

    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf-8');
      if (!raw) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(raw) as unknown);
      } catch (error) {
        reject(error);
      }
    });

    req.on('error', reject);
  });
}

function sendJson(
  res: ServerResponse,
  statusCode: number,
  payload: unknown,
): void {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.end(JSON.stringify(payload));
}

function summarizeApiPlugin(): Plugin {
  return {
    name: 'vidmd-summarize-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const pathname = req.url?.split('?')[0];
        if (pathname !== '/api/summarize') {
          next();
          return;
        }

        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
          res.end();
          return;
        }

        try {
          const body = (await readJsonBody(req)) as {
            url?: string;
            language?: string;
          };
          const language = parseAppLanguage(body.language);

          if (req.method !== 'POST') {
            sendJson(res, 405, {
              error: apiErrorMessage(language, 'methodNotAllowed'),
            });
            return;
          }

          const url = typeof body.url === 'string' ? body.url.trim() : '';

          if (!url) {
            sendJson(res, 400, {
              error: apiErrorMessage(language, 'invalidUrl'),
            });
            return;
          }

          if (!isLikelyYoutubeUrl(url)) {
            sendJson(res, 400, {
              error: apiErrorMessage(language, 'invalidYoutube'),
            });
            return;
          }

          const result = await summarizeVideo({ url, language });
          sendJson(res, 200, result);
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : apiErrorMessage('en-US', 'summarizeFailed');
          sendJson(res, 500, { error: message });
        }
      });
    },
  };
}

const packageJson = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, 'package.json'), 'utf-8'),
) as { version?: string };

const appVersion = packageJson.version ?? '0.0.0';

export default defineConfig(({ mode }) => {
  applyServerEnv(mode);

  return {
    plugins: [react(), summarizeApiPlugin()],
    base: './',
    define: {
      'import.meta.env.VITE_APP_VERSION': JSON.stringify(appVersion),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    },
    server: {
      port: 5173,
      strictPort: true,
    },
  };
});
