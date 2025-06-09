const pathfs = require('path');
const { existsSync } = require('node:fs');
const { cp } = require('node:fs/promises');
const args = require('./args');

module.exports = async function migrateStackMonitor() {
    const localLegacyPath = pathfs.resolve(args.runeyaConfigPath, '../.stackmonitor')
    const localNewPath = args.runeyaConfigPath
    if(existsSync(localLegacyPath) && !existsSync(localNewPath)) {
      console.log('Legacy path found, copy to new path')
      await cp(localLegacyPath, localNewPath, { recursive: true, force: true })
    }

    const globalLegacyPath = pathfs.resolve(args.runeyaGlobalConfigPath, '../.stackmonitor')
    const globalNewPath = args.runeyaGlobalConfigPath
    if(existsSync(globalLegacyPath) && !existsSync(globalNewPath)) {
      console.log('Legacy path found, copy to new path')
      await cp(globalLegacyPath, globalNewPath, { recursive: true, force: true })
    }

    if(existsSync(localLegacyPath) && !existsSync(pathfs.resolve(args.runeyaConfigPath, 'dbs/overrides'))) {
      console.log('Legacy path found, copy to new path')
      await cp(pathfs.resolve(localLegacyPath, 'dbs/overrides'), pathfs.resolve(args.runeyaConfigPath, 'dbs/overrides'), { recursive: true, force: true })
    }

    if(existsSync(localLegacyPath) && !existsSync(pathfs.resolve(args.runeyaConfigPath, 'dbs/encryption-key.json'))) {
      console.log('Legacy path found, copy to new path')
      await cp(pathfs.resolve(localLegacyPath, 'dbs/encryption-key.json'), pathfs.resolve(args.runeyaConfigPath, 'dbs/encryption-key.json'), { recursive: true, force: true })
  }
}