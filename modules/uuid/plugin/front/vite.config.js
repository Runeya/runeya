import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    lib: {
      entry: './src/element.js',
      name: 'index',
      fileName: 'index',
      formats: ['es', 'umd'],
    },
    rollupOptions: {
      external: ['vue', 'vue/compiler-sfc'],
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

  resolve: {
    alias: [{
      find: /~(.+)/,
      replacement: path.join(__dirname, '../../../../node_modules/$1'),
    }, {
      find: /@\//,
      replacement: `${path.join(__dirname, '../../../../../../fronts/app/src/')}/`,
    }, {
      find: /&\//,
      replacement: `${path.join(__dirname, 'modules')}/`,
    }],
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "${path.join(__dirname, '../../../../fronts/app/src/assets/theme/mixin')}" as *;`
      },
    },
  },
})
