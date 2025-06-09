const { existsSync } = require('fs');
const path = require('path');
const { writeFile, readFile, appendFile } = require('fs/promises');
const { randomUUID } = require('crypto');
const dbs = require('../helpers/dbs');
const { generateKey, encrypt, decrypt } = require('../helpers/crypto');
const reencryptNodered = require('../helpers/reencrypt-nodered');
const pathfs = require('path');
const args = require('../helpers/args');

class EncryptionKey {
  constructor() {
    this.encryptionKey = '';
  }

  #getDb() {
    return dbs.getDb('encryption-key', { encrypted: false });
  }

  async init() {
    this.encryptionKey = (await this.#getDb().read()).encryptionKey;
    // Exclude db from git
    const dirname = path.dirname(await dbs.getDb('encryption-key', { encrypted: false }).getPath());
    const gitignorePath = path.resolve(dirname, '.gitignore');
    if (!existsSync(gitignorePath)) {
      await writeFile(gitignorePath, 'encryption-key.json');
    }
    const gitignoreFile = (await readFile(gitignorePath, 'utf-8')).split('\n');
    const gitignoreHasKey = (key) => gitignoreFile.some((line) => line.trim() === key);
    if (!gitignoreHasKey('encryption-key.json')) await appendFile(gitignorePath, '\nencryption-key.json');
    if (!gitignoreHasKey('overrides')) await appendFile(gitignorePath, '\noverrides');
  }

  async update() {
    return this.#getDb().write(this.toStorage());
  }

  toStorage() {
    return {
      encryptionKey: this.encryptionKey,
    };
  }

  async generateKey() {
    return generateKey();
  }

  async testKey(encryptionKey) {
    try {
      const variable = randomUUID();
      const result = await encrypt(variable, { encryptionKey });

      const decrypted = await decrypt(result, { encryptionKey });
      if (decrypted === variable) return true;
      return false;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async saveKey(key, {noReload} = {noReload: false}) {
    if (!await this.testKey(key)) throw new Error('Key not valid');
    try {
      const envSample = (await dbs.getDbs('envs'))[0];
      if (envSample) await dbs.getDb(`envs/${envSample}`).read();
      if (this.encryptionKey) {
        await reencryptNodered(this.encryptionKey, key, pathfs.resolve(require('./stack').getRootPath(), 'nodered/flow_cred.json'))
        await dbs.reencrypt(this.encryptionKey, key)
      };
    } catch (error) {
      console.error(error);
    }
    const shouldRestart = this.encryptionKey !== key
    this.encryptionKey = key;
    await this.update();
    if(!noReload) {
      await require('./stack').selectConf();
    }
    if(shouldRestart) {
      console.log('Restart...')
      require("child_process").spawn(process.argv[0], process.argv.slice(1), {
        cwd: args.initialCwd,
        detached: true,
        stdio: "inherit"
      }).unref();
      process.exit(0)
    }
    return key;
  }
}

module.exports = new EncryptionKey();
