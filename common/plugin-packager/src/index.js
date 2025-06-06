const path =require('path');
const { cp, writeFile, rm, mkdir, readFile } =require('fs/promises');
const compressing =require('compressing');
const { existsSync, createReadStream } = require('fs');
const FormData = require('form-data');
const axios = require('axios').default;

const projectRoot = path.resolve('.');
const distPath = path.resolve('.', 'dist/plugins');
const frontDistPath = path.resolve(distPath, 'front');
const backendDistPath = path.resolve(distPath, 'backend');
const themeDistPath = path.resolve(distPath, 'theme');
const viteProjectPath = path.resolve(projectRoot, 'front');
const backendProjectPath = path.resolve(projectRoot, 'backend');
const themeProjectPath = path.resolve(projectRoot, 'theme');
const archiveTarget = path.resolve(projectRoot, 'dist/runeya.tar.gz');
const spawn = require('child_process').spawn;
console.log(projectRoot)

const exec = async (cmd, options = {}) => {
  console.log('🔍 Executing command:', cmd, "in", options.cwd);
  const child = spawn(cmd, {
    shell: true,
    stdio: 'inherit', 
    ...options
  });
  return new Promise((resolve, reject) => {
    child.on('close', (code) => {
      if (code === 0) {
        resolve(null);
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });
  });
}


module.exports = async function buildAndPackage() {
  if(!process.env.PLUGINS_API_URL) {
    console.log('❌ PLUGINS_API_URL is not set');
  }
  if(!process.env.PLUGINS_API_KEY) {
    console.log('❌ PLUGINS_API_KEY is not set');
  }
  if(!process.env.RUNEYA_API_URL) {
    console.log('❌ RUNEYA_API_URL is not set');
  }
  await rm(path.resolve(projectRoot, 'dist'), {recursive: true, force: true})
  let {version} = require(path.resolve(projectRoot, 'package.json'))
  const name = require(path.resolve(projectRoot, 'package.json')).name
  console.log('📦 Name:', name);
  console.log('📦 Version:', version);
  console.log('📦 Packaging front-end...');

  // Step 1: Build front with Vite
  console.log('📦 Building...', viteProjectPath);
  console.time('📦 Building...');
  await Promise.all([
    existsSync(viteProjectPath) && exec('yarn vite build', {
      cwd: viteProjectPath,
      env: process.env,
    }), 
    existsSync(backendProjectPath) && exec('yarn tsup', {
      cwd: backendProjectPath,
      env: process.env,
    }),
    existsSync(themeProjectPath) && exec('yarn tsup', {
      cwd: themeProjectPath,
      env: process.env,
    }),
  ].filter(Boolean));
  console.timeEnd('📦 Building...');
  console.time('📦 Copying dist...');
  console.log('📦 Copying dist...', frontDistPath);
  await Promise.all([
    existsSync(path.resolve(viteProjectPath, 'dist')) && cp(path.resolve(viteProjectPath, 'dist'), frontDistPath, {
      recursive: true
    }),
    existsSync(path.resolve(backendProjectPath, 'dist')) && cp(path.resolve(backendProjectPath, 'dist'), backendDistPath, {
      recursive: true
    }),
    existsSync(path.resolve(themeProjectPath, 'dist')) && cp(path.resolve(themeProjectPath, 'dist'), themeDistPath, {
      recursive: true
    }),
  ].filter(Boolean));
  console.timeEnd('📦 Copying dist...');
  console.log('📦 Generating files...');
  console.time('📦 Generating files...');
  if(existsSync(path.resolve(projectRoot, 'README.md'))) {
    await cp(path.resolve(projectRoot, 'README.md'), path.resolve(distPath, 'README.md'));
  }
  const packageJson = JSON.parse(await readFile(path.resolve(projectRoot, 'package.json'), 'utf-8'))
  if(existsSync(path.resolve(projectRoot, 'package-lock.json'))) {
    await cp(path.resolve(projectRoot, 'package-lock.json'), path.resolve(distPath, 'package-lock.json'))
  }
  if(existsSync(path.resolve(projectRoot, 'yarn.lock'))) {
    await cp(path.resolve(projectRoot, 'yarn.lock'), path.resolve(distPath, 'yarn.lock'))
  }
  await writeFile(path.resolve(distPath, 'package.json'), JSON.stringify(packageJson, null, 2), 'utf-8')
  console.timeEnd('📦 Generating files...');
  console.log('📦 Compressing...');
  console.time('📦 Compressing...');
  await compressing.tgz.compressDir(distPath, archiveTarget, {
    ignoreBase: true,
    relativePath: '/'
  });
  console.timeEnd('📦 Compressing...');
  console.log(`✅ Archive created at: ${archiveTarget}`);
  const remotePath = `${process.env.PLUGINS_API_URL}/api/plugins/download/${encodeURIComponent(name)}/${version}`

  async function putObject(filePath) {
    try {
      const form = new FormData();
      form.append('file', createReadStream(filePath));

      await axios.post(process.env.PLUGINS_API_URL + '/api/plugins/upload', form, {
        headers: {
          ...form.getHeaders(),
          'x-api-key': process.env.PLUGINS_API_KEY
        },
      })

      console.log('📦 Plugin uploaded successfully', remotePath);
    } catch (error) {
      console.error("Erreur lors du listing :", error);
    }
  }
  console.time('📦 Installing plugin...');
  if(process.env.PLUGINS_API_URL && process.env.PLUGINS_API_KEY) {
    console.log('📦 Installing plugin...');
    await putObject(archiveTarget);

    if(process.env.RUNEYA_API_URL && process.env.PLUGINS_API_URL) {
      console.log('📦 Installing plugin...');
      await axios.post(`${process.env.RUNEYA_API_URL}/plugins/install?force=true`, {
        url: remotePath
      }, {
        headers: {
          'x-api-key': process.env.PLUGINS_API_KEY
        }
      })
      console.log('📦 Plugin installed successfully. Please restart the server to use the new plugin.');
    }
  }
  console.timeEnd('📦 Installing plugin...');
}