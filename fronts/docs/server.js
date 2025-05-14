#!/usr/bin/env node
import express from 'express'
import path from 'path'
import compression from 'compression';
import { fileURLToPath } from 'url';
import { globSync } from 'glob';
import pathfs from 'path';
import { readFileSync, writeFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const files = globSync(`${pathfs.resolve(__dirname, '.vitepress/dist')}/**/*.js`, { ignore: 'node_modules/**' });
const envs = readFileSync(pathfs.resolve(__dirname, '.env.stack'), 'utf-8')
  ?.split('\n')
  .map((env) => env.split('=').pop())
  .sort((a,b) => b.localeCompare(a))
  .filter((a) => a.startsWith('DYNAMIC_VUE_APP'))
  || [];
files.forEach((filename) => {
  const path = pathfs.resolve(__dirname, filename);
  let file = readFileSync(path, 'utf-8');
  envs.forEach((env) => {
    file = file.replaceAll(env, process.env[env.replace('DYNAMIC_', '')] || '');
  });
  writeFileSync(path, file, 'utf-8');
});

const app = express()
app.use(compression())
if(process.env.NO_SEO) {
  app.use('/robots.txt', (req, res) => {
    res.setHeader("Content-Type", "text/plain; charset=UTF-8")
    res.send(`User-agent: *
Disallow: /`)
  })
}
app.use(express.static(path.resolve(__dirname, '.vitepress/dist')))
app.use((req, res) => {
  res.type('.html').sendFile(path.resolve(__dirname, '.vitepress/dist', 'index.html'));
})
app.listen(process.env.PORT || 3203, () => {
    console.info('Magic happens on port ', process.env.PORT || 3203)
  })
