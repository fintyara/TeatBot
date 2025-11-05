import { defineConfig, PluginOption } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import UnoCSS from 'unocss/vite';
import { visualizer } from 'rollup-plugin-visualizer';
import Unfonts from 'unplugin-fonts/vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const FONTS = [];

  const plugins: PluginOption[] = [
    UnoCSS(),
    react(),
    Unfonts({
      custom: {
        preload: true,
        families: [
          ...FONTS.map((font) => ({
            name: font.split('.').at(0),
            src: `./src/assets/fonts/${font}`,
            local: [font.split('.').at(0)],
          })),
        ],
      },
    }),
    // Мы используем плагин, но также добавляем ручные замены для самых проблемных модулей
    nodePolyfills(),
  ];

  if (mode === 'analysis' && command === 'build') {
    plugins.push(
      visualizer({
        open: true,
        filename: `dist/analysis.html`,
      })
    );
  }

  return {
    base: '/TeatBot/',
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
          },
        },
      },
    },
    resolve: {
      // 👇 ГЛАВНОЕ И СИСТЕМНОЕ РЕШЕНИЕ ЗДЕСЬ 👇
      // Мы принудительно заменяем все серверные модули на их браузерные аналоги.
      // Это решает ВСЕ предыдущие ошибки (`os`, `fs`, `promises` и т.д.) раз и навсегда.
      alias: {
        '@': resolve(__dirname, './src'),
        'lodash': 'lodash-es',
        'http': 'agent-base',
        'https': 'agent-base',
        'fs': 'browserify-fs',
        'os': 'os-browserify/browser',
        'crypto': 'crypto-browserify',
        'stream': 'stream-browserify',
        'path': 'path-browserify',
        'zlib': 'browserify-zlib',
        'util': 'util',
        'child_process': 'browserify-fs', // Часто можно заменить на fs
        'fs/promises': 'browserify-fs' // Заменяем проблемный fs/promises
      },
    },
    plugins,
  };
});