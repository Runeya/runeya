import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import fs from 'fs'
import EnvironmentPlugin from 'vite-plugin-environment'
import dotenv from 'dotenv'
import { createHtmlPlugin } from 'vite-plugin-html';

const hash = Math.floor(Math.random() * 90000) + 10000;

const dotEnvPath = path.resolve(__dirname, '.env')
const dotEnvs = fs.existsSync(dotEnvPath) 
  ? dotenv.parse(fs.readFileSync(dotEnvPath, 'utf-8'))
  : {}
const dotEnvPathProduction = path.resolve(__dirname, '.env.stack')
const dotEnvsProduction = fs.existsSync(dotEnvPathProduction) 
  ? dotenv.parse(fs.readFileSync(dotEnvPathProduction, 'utf-8'))
  : {}
function parseEnvs(_envs) {
  return Object
    .keys(_envs)
    .filter(p => p.startsWith('VUE_APP_'))
    .reduce((envs, key) => {
      envs[key] = _envs[key]
      return envs
    }, {})
}
// https://vitejs.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `[name]` + hash + `.js`,
        chunkFileNames: `[name]` + hash + `.js`,
        assetFileNames: `[name]` + hash + `.[ext]`
      }
    }
  },
  define: {
    'process.env': Object.assign(
      {},
      parseEnvs(dotEnvsProduction),
      parseEnvs(process.env),
      parseEnvs(dotEnvs),
    )
  },
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: tag => tag.startsWith('ion-icon')
        },
      }
    }),
    createHtmlPlugin({
      minify: true,
      inject: {
        data: {
          title: 'Runeya - Process Management and Monitoring',
        },
      },
    }),
    EnvironmentPlugin('all', { prefix: 'VUE_APP_' }),
    EnvironmentPlugin('all', { prefix: 'VITE_APP_' }),
  ],
  resolve: {
    preserveSymlinks: true,
    alias: {
      "~": path.resolve("node_modules"),
      "@": path.resolve("src")
    }
  },
  server: {
    host: true,
    port: 5555,
    watch: {
      followSymlinks: true,
    }
  },
})


