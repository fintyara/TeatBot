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
    // Возвращаемся к ручной настройке, но теперь со всеми проблемными модулями
    nodePolyfills({
      // Мы явно указываем все серверные модули, которые вызывали у нас проблемы.
      // Это предотвратит как ошибки, так и конфликты автоматического режима.
      include: ['path', 'stream', 'util', 'os', 'fs', 'process', 'buffer'],
      // Мы также можем добавить глобальные переменные, чтобы избежать проблем с ними
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      // Этот протокол явно указывает, как обрабатывать импорты
      protocolImports: true,
    })
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
      alias: {
        '@': resolve(__dirname, './src'),
        lodash: 'lodash-es',
      },
    },
    plugins,
  };
});