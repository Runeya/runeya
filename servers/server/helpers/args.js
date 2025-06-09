const path = require('path');

const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers');
const { existsSync } = require('fs');
const yarg = yargs(hideBin(process.argv))
  .usage('Usage: <path-to-your-stack> [options]')

  .alias('pe', 'pull-env')
  .describe('pe', 'Pull env from a service (need --environment and --service)')
  .default('pe', false)

  .alias('e', 'environment')
  .describe('e', 'Choose your environment')
  .default('e', undefined)

  .alias('s', 'service')
  .describe('s', 'Service')
  .default('s', undefined)

  .alias('ss', 'services')
  .describe('ss', 'Services')
  .default('ss', [])

  .boolean(['pe'])
  .string(['e', 's'])
  .array(['ss'])

  .help('h')
  .alias('h', 'help')
  .parse()
const rootPath = path.resolve(yarg['_']?.[0] || '.')
/** @type {Awaited<yarg> &  {rootPath: string, initialCwd: string, runeyaConfigPath: string, runeyaGlobalConfigPath: string}} */
const args = Object.assign({
  rootPath,
  initialCwd: '',
  runeyaConfigPath: path.resolve(rootPath, '.runeya'),
  runeyaGlobalConfigPath: path.resolve(require('os').homedir(), '.runeya-global'),
}, yarg);

if(!existsSync(args.rootPath)) {
  console.error('Error: Runeya was launched with an invalid root path that does not exist. Please check your launch command. \nPath: ', args.rootPath)
  process.exit(1)
}

if (args.rootPath) {
  args.initialCwd = process.cwd()
  process.chdir(args.rootPath)
}

if (args.pullEnv && !args.service) {
  console.error('Error: --service needed')
  process.exit(1)
}
if (args.pullEnv && !args.environment) {
  console.error('Error: --environment needed')
  process.exit(1)
}
module.exports = args 
