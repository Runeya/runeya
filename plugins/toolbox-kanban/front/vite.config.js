import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { libInjectCss } from 'vite-plugin-lib-inject-css';

export default defineConfig(({ mode }) => {
  return {
    plugins: [
      vue(),
      libInjectCss(),
    ],
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      lib: {
        entry: './element.js',
        name: 'index',
        fileName: 'index',
        formats: ['umd'],
      },
      rollupOptions: {
        external: [
          'vue',
          'vue/compiler-sfc',
        ],
        output: {
          globals: {
            vue: 'Vue',
          },
        },
      },
    },
    define: {
      'process.env': {}
    },
  }
})
