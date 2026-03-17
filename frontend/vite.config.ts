/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'json-summary'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/test/**',
        'src/**/*.test.{ts,tsx}',
        'src/**/*.d.ts',
        'src/main.tsx',
        'src/vite-env.d.ts',
      ],
    },
  },
  server: {
    // Pre-transform entry files at startup so the first browser request is
    // served from cache instead of triggering on-demand compilation of the
    // entire module graph (244 TS files) over the slow Windows/WSL2 bind mount.
    warmup: {
      clientFiles: ['./src/main.tsx', './src/App.tsx'],
    },
    // Explicit polling watcher for Windows/WSL2 bind mounts where inotify
    // events don't cross the filesystem boundary. Interval kept at 1s to
    // balance HMR responsiveness against CPU overhead from polling.
    watch: {
      usePolling: true,
      interval: 1000,
    },
  },
})
