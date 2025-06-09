const { execSync } = require('child_process');

const path = require('path');

const {
  cpSync, existsSync, mkdirSync, readFileSync,
  writeFileSync,
  rmSync,
} = require('fs');

if (existsSync(path.resolve(__dirname, './out'))) {
  rmSync(path.resolve(__dirname, './out'), { recursive: true, force: true });
}
if (!existsSync(path.resolve(__dirname, './out'))) {
  mkdirSync(path.resolve(__dirname, './out'));
}
if (!existsSync(path.resolve(__dirname, './out/src'))) {
  mkdirSync(path.resolve(__dirname, './out/src'));
}

console.time('build.esbuild');
execSync('esbuild ./src/extension.js --bundle --outfile=out/src/main.js --external:vscode --format=cjs --platform=node', { stdio: 'inherit', cwd: __dirname });
console.timeEnd('build.esbuild');

console.time('build.copy');
cpSync(path.resolve(__dirname, './package.json'), path.resolve(__dirname, './out/package.json'));
cpSync(path.resolve(__dirname, './resources'), path.resolve(__dirname, './out/resources'), { recursive: true });
console.timeEnd('build.copy');

console.time('build.package');
let packageJSON = readFileSync(path.resolve(__dirname, './out/package.json'), 'utf-8');
packageJSON = packageJSON
  .replaceAll('"main": "./src/extension.js",', '"main": "./src/main.js",')
  .replaceAll('"name": "@runeya/modules-vscode-extension",', '"name": "runeya",');
console.timeEnd('build.package');

writeFileSync(path.resolve(__dirname, './out/package.json'), packageJSON, 'utf-8');
writeFileSync(path.resolve(__dirname, './out/LICENSE'), 'MIT', 'utf-8');

console.time('build.package.vsce.npm');
execSync('npm i --omit=dev --no-audit --no-fund --no-save --no-package-lock', { stdio: 'inherit', cwd: path.resolve(__dirname, './out') });
console.timeEnd('build.package.vsce.npm');

console.time('build.package.vsce.vsix');
execSync('vsce package -o runeya.vsix', { stdio: 'inherit', cwd: path.resolve(__dirname, './out') });
console.timeEnd('build.package.vsce.vsix');
