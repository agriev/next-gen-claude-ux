import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        '@shared': path.resolve(__dirname, 'shared')
      }
    },
    build: {
      rollupOptions: {
        input: { index: path.resolve(__dirname, 'electron/main/index.ts') }
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: { '@shared': path.resolve(__dirname, 'shared') }
    },
    build: {
      rollupOptions: {
        input: { index: path.resolve(__dirname, 'electron/preload/index.ts') }
      }
    }
  },
  renderer: {
    root: path.resolve(__dirname, 'renderer'),
    plugins: [react()],
    resolve: {
      alias: {
        '@renderer': path.resolve(__dirname, 'renderer/src'),
        '@shared': path.resolve(__dirname, 'shared')
      }
    },
    build: {
      rollupOptions: {
        input: { index: path.resolve(__dirname, 'renderer/index.html') }
      }
    },
    server: {
      port: 5173
    }
  }
});
