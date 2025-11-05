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
    // 👇 ГЛАВНОЕ ИЗМЕНЕНИЕ: Мы убираем все ограничения и позволяем плагину работать в полную силу 👇
    nodePolyfills()
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