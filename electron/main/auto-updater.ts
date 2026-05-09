// Auto-update via electron-updater.
//
// In packaged builds, checks the GitHub Releases feed of `agriev/next-gen-claude-ux`
// for a newer tagged version (`v*`), downloads in the background, and surfaces
// a "Restart to update" prompt the next time the user is idle.
//
// In dev (when `app.isPackaged` is false) this is a no-op so we never hit the
// network from a working tree.
//
// The updater is intentionally silent on `update-not-available` to avoid noisy
// log lines on every launch. All errors are caught — a failed update should
// never crash the app.

import { app, BrowserWindow, dialog } from 'electron';
import { bus } from './event-bus';

type UpdaterModule = typeof import('electron-updater');
type AutoUpdater = UpdaterModule['autoUpdater'];

let started = false;

export interface AutoUpdaterOptions {
  getWindow: () => BrowserWindow | null;
}

function log(text: string): void {
  bus.emit('agentLog', {
    agentRole: 'worker',
    agentId: 'auto-updater',
    text,
    ts: Date.now(),
    kind: 'note'
  });
}

/**
 * Boot the auto-updater. Safe to call multiple times — only the first call
 * actually starts checking.
 */
export async function startAutoUpdater(opts: AutoUpdaterOptions): Promise<void> {
  if (started) return;
  started = true;

  if (!app.isPackaged) {
    return; // dev mode — never check for updates
  }

  // Lazy import so the dependency is only loaded in production builds.
  let mod: UpdaterModule;
  try {
    mod = await import('electron-updater');
  } catch (err) {
    console.warn('[auto-updater] electron-updater not installed — skipping', err);
    return;
  }

  const updater: AutoUpdater = mod.autoUpdater;
  updater.autoDownload = true;
  updater.autoInstallOnAppQuit = true;
  updater.allowPrerelease = false;

  updater.on('checking-for-update', () => {
    log('Checking for updates');
  });

  updater.on('update-available', (info: { version: string }) => {
    log(`Update available: ${info.version}`);
  });

  updater.on('update-not-available', () => {
    /* silent */
  });

  updater.on('error', (err: Error) => {
    console.warn('[auto-updater] error', err.message);
  });

  updater.on('update-downloaded', async (info: { version: string }) => {
    const win = opts.getWindow();
    if (!win) return;
    const result = await dialog.showMessageBox(win, {
      type: 'info',
      buttons: ['Restart now', 'Later'],
      defaultId: 0,
      cancelId: 1,
      title: 'Update ready',
      message: `Interactive Jarvis ${info.version} is ready to install.`,
      detail: 'The app will restart to apply the update. Your canvas state is saved automatically.'
    });
    if (result.response === 0) {
      setImmediate(() => updater.quitAndInstall());
    }
  });

  try {
    await updater.checkForUpdates();
  } catch (err) {
    console.warn('[auto-updater] initial check failed', err);
  }
}
