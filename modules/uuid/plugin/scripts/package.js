// scripts/package.js
const path =require('path');
const { cp, writeFile, rm, mkdir, readFile } =require('fs/promises');
const compressing =require('compressing');
const { execSync } =require('child_process');
const { existsSync, createReadStream } = require('fs');
const { randomUUID } = require('crypto');
const { mongo } = require('@runeya/common-mongo');
const { default: axios } = require('axios');

const projectRoot = path.resolve(__dirname, '..');
const distPath = path.resolve(projectRoot, 'dist/plugins');
const frontDistPath = path.resolve(distPath, 'front');
const backendDistPath = path.resolve(distPath, 'backend');
const viteProjectPath = path.resolve(projectRoot, 'front');
const backendProjectPath = path.resolve(projectRoot, 'backend');
const archiveTarget = path.resolve(projectRoot, 'dist/runeya.tar.gz');

async function buildAndPackage() {
  if(!process.env.PLUGINS_API_URL) {
    console.log('❌ PLUGINS_API_URL is not set');
    process.exit(1);
  }
  if(!process.env.PLUGINS_API_KEY) {
    console.log('❌ PLUGINS_API_KEY is not set');
    process.exit(1);
  }
  await rm(path.resolve(projectRoot, 'dist'), {recursive: true, force: true})
  let {version} = require('../package.json')
  const name = require('../package.json').name
  console.log('📦 Version:', version);
  console.log('📦 Packaging front-end...');

  // Step 1: Build front with Vite
  console.log('📦 Building front-end...', viteProjectPath);
  execSync('yarn vite build', {
    cwd: viteProjectPath,
    env: process.env,
    stdio: 'inherit'
  });

  // Step 1: Build front with Vite
  execSync('yarn tsup', {
    cwd: backendProjectPath,
    env: process.env,
    stdio: 'inherit'
  });

  await cp(path.resolve(viteProjectPath, 'dist'), frontDistPath, {
    recursive: true
  });
  await cp(path.resolve(backendProjectPath, 'dist'), backendDistPath, {
    recursive: true
  });
  if(existsSync(path.resolve(projectRoot, 'README.md'))) {
    await cp(path.resolve(projectRoot, 'README.md'), path.resolve(distPath, 'README.md'));
  }

  const entrypoint = path.resolve(projectRoot, './dist/plugins/config.json')
  await writeFile(entrypoint, JSON.stringify({
    backend: './backend/index.js',
    front: {
      js: './front/index.umd.js',
      css: './front/index.css',
    },
   name,
    version,
  }), 'utf-8')

  await compressing.tgz.compressDir(distPath, archiveTarget, {
    ignoreBase: true,
    relativePath: '/'
  });

  console.log(`✅ Archive created at: ${archiveTarget}`);

  const pluginPath =  path.resolve(__dirname, `../../../../servers/plugins/routes/public/plugins/${name}/${version}`)
  if(!existsSync(pluginPath)) await mkdir(pluginPath, {recursive: true})
  await cp(archiveTarget, path.resolve(pluginPath, 'runeya.tar.gz'), )

  async function putObject(filePath) {
    try {
      const axios = require('axios').default;
      const FormData = require('form-data');

      const form = new FormData();
      form.append('file', createReadStream(filePath));

      await axios.post(process.env.PLUGINS_API_URL + '/api/plugins/upload', form, {
        headers: {
          ...form.getHeaders(),
          'x-api-key': process.env.PLUGINS_API_KEY
        },
      })

    } catch (error) {
      console.error("Erreur lors du listing :", error);
    }
  }

  const result =  await putObject(archiveTarget);


}

buildAndPackage().catch(err => {
  console.error('❌ Packaging failed:', err);
  process.exit(1);
});