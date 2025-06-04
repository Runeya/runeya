import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'

export default defineConfig(({ mode }) => {
  return {
    plugins: [
      vue(),
      cssInjectedByJsPlugin()
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
          manualChunks: undefined,
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
