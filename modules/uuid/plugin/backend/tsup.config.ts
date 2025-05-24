import { rmSync } from 'fs';
import { defineConfig } from 'tsup';
import path from 'path'

const distPath = process.env.DIST_PATH
  ? path.resolve(process.env.DIST_PATH)
  : path.resolve(__dirname, "dist")

rmSync(distPath, {recursive: true, force: true})


export default defineConfig({
  entry: ['./index.js'],
  outDir: distPath,
  clean: true,
  bundle: true,
  esbuildPlugins: [],
  noExternal: [
    /@runeya\/.*/,
  ],
  sourcemap: true,
});
