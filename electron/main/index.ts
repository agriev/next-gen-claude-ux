import { app, BrowserWindow, shell } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WorldState } from './world-state';
import { registerIpc, seedMarketingBoard } from './ipc';
import { Orchestrator } from './orchestrator';
import { FsSync } from './fs-sync';
import { startAutoUpdater } from './auto-updater';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let mainWindow: BrowserWindow | null = null;
const world = new WorldState();

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 1000,
    show: false,
    backgroundColor: '#0A0B0E',
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 16, y: 16 },
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.mjs'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show();
  });

  // Allow microphone access for voice input (Web Speech API + getUserMedia)
  mainWindow.webContents.session.setPermissionRequestHandler((_wc, permission, callback) => {
    if (permission === 'media' || permission === 'mediaKeySystem') {
      callback(true);
      return;
    }
    callback(false);
  });
  mainWindow.webContents.session.setPermissionCheckHandler((_wc, permission) => {
    return permission === 'media' || permission === 'mediaKeySystem';
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  const devUrl = process.env['ELECTRON_RENDERER_URL'];
  if (devUrl) {
    mainWindow.loadURL(devUrl);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }
}

let orchestrator: Orchestrator | null = null;
let fsSync: FsSync | null = null;

app.whenReady().then(async () => {
  world.init();
  orchestrator = new Orchestrator(world);
  registerIpc(world, orchestrator, () => mainWindow);
  createWindow();
  orchestrator.start();
  if (process.env['JARVIS_FS_SYNC'] !== '0') {
    fsSync = new FsSync(world);
    fsSync.start();
  }
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  if (process.env['JARVIS_SEED_MOCKS'] === '1' && world.getAllArtifacts().length === 0) {
    setTimeout(async () => {
      await seedMarketingBoard(world);
    }, 1200);
  } else if (process.env['JARVIS_SEED_MOCKS'] === '1' && world.getAllPanels().length === 0) {
    // Wave 7+8 — DB already has artifacts from a pre-panel seed, but the new
    // demo panels are missing. Seed panels only so existing users see the
    // chart/flow/timeline content without losing their hand-arranged artifacts.
    setTimeout(async () => {
      const { seedDemoPanelsOnly } = await import('./ipc');
      await seedDemoPanelsOnly(world);
    }, 1200);
  }

  // Check for updates 4s after launch so the network call doesn't compete with
  // first-paint or agent boot. No-op in dev (`app.isPackaged === false`).
  if (process.env['JARVIS_DISABLE_UPDATER'] !== '1') {
    setTimeout(() => {
      startAutoUpdater({ getWindow: () => mainWindow }).catch((err) => {
        console.warn('[auto-updater] startup failed', err);
      });
    }, 4000);
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  fsSync?.stop();
  orchestrator?.stop();
  world.close();
});
