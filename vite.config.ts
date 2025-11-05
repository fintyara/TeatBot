import { defineConfig, PluginOption } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import UnoCSS from 'unocss/vite';
import Unfonts from 'unplugin-fonts/vite';
import { visualizer } from 'rollup-plugin-visualizer';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig(({ command, mode }) => {
  const FONTS: string[] = [];
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
    nodePolyfills({ protocolImports: true })
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
    define: {
      global: 'globalThis',
      'process.env': {}
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
        lodash: 'lodash-es',
        fs: resolve(__dirname, './src/shims/empty.ts'),
        'fs/promises': resolve(__dirname, './src/shims/empty.ts'),
        path: 'path-browserify',
        process: 'process/browser',
        stream: 'stream-browserify',
        util: 'util',
        buffer: 'buffer'
      }
    },
    optimizeDeps: {
      exclude: ['fs', 'fs/promises']
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom']
          }
        }
      },
      commonjsOptions: {
        transformMixedEsModules: true
      },
      target: 'es2020',
      assetsInlineLimit: 0
    },
    assetsInclude: ['**/*.data', '**/*.wasm', '**/*.unityweb', '**/*.br', '**/*.gz'],
    plugins
  };
});
