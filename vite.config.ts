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
    // Плагин остается, чтобы обработать простые случаи
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
      // 👇 ХИРУРГИЧЕСКОЕ ВМЕШАТЕЛЬСТВО 👇
      // Мы явно приказываем сборщику заменить конкретный проблемный модуль на его браузерный аналог.
      alias: {
        '@': resolve(__dirname, './src'),
        'lodash': 'lodash-es',
        // Это правило напрямую решает последнюю ошибку 'ENOTDIR'
        'fs/promises': 'browserify-fs',
      },
    },
    plugins,
  };
});