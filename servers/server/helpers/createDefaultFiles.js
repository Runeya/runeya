const pathfs = require('path');
const { existsSync } = require('node:fs');
const { writeFile, readFile, appendFile } = require('node:fs/promises');
const args = require('./args');
const dbs = require('../helpers/dbs'); 

module.exports = async function createDefaultFiles() {
  await createGitignore();
  await createPluginsGitignore();
}

async function createPluginsGitignore() {
  const gitignorePath = pathfs.resolve(args.runeyaConfigPath, '.gitignore');
  if(!existsSync(gitignorePath)) await writeFile(gitignorePath, '');
  const gitignoreFile = (await readFile(gitignorePath, 'utf-8')).split('\n');
  const gitignoreHasKey = (key) => gitignoreFile.some((line) => line.trim() === key);
  if (!gitignoreHasKey('plugins.json')) await appendFile(gitignorePath, '\nplugins.json');
  if (!gitignoreHasKey('plugins')) await appendFile(gitignorePath, '\nplugins');
}

async function createGitignore() {
    const dirname = pathfs.dirname(await dbs.getDb('encryption-key', { encrypted: false, defaultData: {} }).getPath());
    const gitignorePath = pathfs.resolve(dirname, '.gitignore');
    if (!existsSync(gitignorePath)) {
      await writeFile(gitignorePath, 'encryption-key.json');
    }
    const gitignoreFile = (await readFile(gitignorePath, 'utf-8')).split('\n');
    const gitignoreHasKey = (key) => gitignoreFile.some((line) => line.trim() === key);
    if (!gitignoreHasKey('encryption-key.json')) await appendFile(gitignorePath, '\nencryption-key.json');
    if (!gitignoreHasKey('overrides')) await appendFile(gitignorePath, '\noverrides'); 
}