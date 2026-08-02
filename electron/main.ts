import {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  nativeTheme,
  shell,
  type SaveDialogOptions,
} from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import { getAppVersion } from '../src/core/version';
import {
  apiErrorMessage,
  parseAppLanguage,
  summarizeVideo,
  type SummarizeRequest,
  type SummarizeResult,
} from '../src/core/summarize';
import { isLikelyYoutubeUrl } from '../src/core/youtube';

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  const isMac = process.platform === 'darwin';

  mainWindow = new BrowserWindow({
    width: 960,
    height: 720,
    minWidth: 720,
    minHeight: 560,
    title: 'Vid.md',
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#171B24' : '#E8EEF6',
    titleBarStyle: isMac ? 'hiddenInset' : 'default',
    trafficLightPosition: isMac ? { x: 16, y: 16 } : undefined,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  const devServerUrl = process.env.VITE_DEV_SERVER_URL;

  if (devServerUrl) {
    void mainWindow.loadURL(devServerUrl);
  } else {
    void mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'));
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

async function summarizeViaCloudApi(
  request: SummarizeRequest,
): Promise<SummarizeResult> {
  const baseUrl = process.env.VIDMD_API_URL?.replace(/\/$/, '');
  if (!baseUrl) {
    throw new Error('VIDMD_API_URL is not configured.');
  }

  const response = await fetch(`${baseUrl}/api/summarize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  const data = (await response.json().catch(() => null)) as {
    markdown?: string;
    error?: string;
  } | null;

  if (!response.ok) {
    throw new Error(
      data?.error ?? apiErrorMessage(request.language, 'summarizeFailed'),
    );
  }

  if (!data?.markdown || typeof data.markdown !== 'string') {
    throw new Error(
      request.language === 'pt-BR'
        ? 'Resposta inválida da API de resumo.'
        : 'Invalid summary API response.',
    );
  }

  return { markdown: data.markdown };
}

async function handleSummarizeRequest(
  payload: SummarizeRequest,
): Promise<SummarizeResult> {
  const language = parseAppLanguage(payload?.language);

  if (!payload?.url || typeof payload.url !== 'string') {
    throw new Error(apiErrorMessage(language, 'invalidUrl'));
  }

  const url = payload.url.trim();

  if (!isLikelyYoutubeUrl(url)) {
    throw new Error(apiErrorMessage(language, 'invalidYoutube'));
  }

  if (process.env.VIDMD_API_URL) {
    return summarizeViaCloudApi({ url, language });
  }

  return summarizeVideo({ url, language });
}

function registerIpcHandlers(): void {
  ipcMain.handle('app:get-version', () => getAppVersion());

  ipcMain.handle('summary:request', async (_event, payload: SummarizeRequest) =>
    handleSummarizeRequest(payload),
  );

  ipcMain.handle('markdown:export', async (_event, markdown: string) => {
    if (typeof markdown !== 'string' || markdown.trim().length === 0) {
      throw new Error('No content to export.');
    }

    const options: SaveDialogOptions = {
      title: 'Export Markdown',
      defaultPath: 'vidmd-summary.md',
      filters: [{ name: 'Markdown', extensions: ['md'] }],
    };

    const result = mainWindow
      ? await dialog.showSaveDialog(mainWindow, options)
      : await dialog.showSaveDialog(options);

    if (result.canceled || !result.filePath) {
      return { ok: false, canceled: true };
    }

    fs.writeFileSync(result.filePath, markdown, 'utf-8');
    return { ok: true };
  });
}

app.whenReady().then(() => {
  registerIpcHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
