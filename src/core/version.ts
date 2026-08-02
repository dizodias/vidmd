import { app } from 'electron';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Reads the app version from package.json in a safe way for the Electron main process.
 * Falls back to "0.0.0" if the file cannot be read or parsed.
 */
export function getAppVersion(): string {
  try {
    const packagePath = path.join(app.getAppPath(), 'package.json');
    const raw = fs.readFileSync(packagePath, 'utf-8');
    const pkg = JSON.parse(raw) as { version?: string };

    if (typeof pkg.version === 'string' && pkg.version.trim().length > 0) {
      return pkg.version.trim();
    }

    return '0.0.0';
  } catch {
    return '0.0.0';
  }
}
