#!/usr/bin/env node
process.env.PREFERRED_WORKSPACE_MANAGER = 'yarn';
const { watch } = require('chokidar');
const { getPackageInfos } = require('workspace-tools');
const pathfs = require('path');
const { spawn } = require('node:child_process');
const debounce = require('debounce');
const killport = require('kill-port');
const net = require('net');
const kill = require('tree-kill');
const { platform } = require('node:os');

const rootPath = pathfs.resolve('../../');

const command = {
  cmd: process.argv[2],
  args: process.argv.slice(3),
};
const ignored = [
  new RegExp('.*/.*volumes.*'),
  new RegExp('.*/.*node_modules.*'),
  new RegExp('.*/.*dist.*'),
  new RegExp('.*/.*git.*'),
  new RegExp('.*/.*yarn.*'),
  new RegExp('.*/.*turbo.*'),
  new RegExp('.*/.*test-report.xml.*'),
  new RegExp('.*/.*tsup.*'),
  new RegExp('.*/.*vite.*'),
  new RegExp('.*/.*logs-express.*'),
  new RegExp('.*/.*coverage.*'),
  new RegExp('.*/.*sandbox-node-repl.*'),
  new RegExp('.*/.*public.*'),
];
let restartInProgress = false;
let pid;
let waitingRestart;

(async () => {
  const watchableDeps = getWatchableDeps(pathfs.resolve('.'));
  console.log('<h1 style="padding: 0;margin: 0">Listening these deps</h1><ul style="margin: 0">', watchableDeps.map((a) => `<li>${a.name}</li>`).join(''), '</ul>');
  mainProcessDaemon();
  await runMainProcess();
  watchDeps(watchableDeps, (packageInfo) => {
    console.log('Changed occured', packageInfo.name);
    runMainProcess();
    return packageInfo;
  });
})();

function mainProcessDaemon() {
  setInterval(() => {
    if (!restartInProgress) {
      if (waitingRestart) {
        const toRun = waitingRestart;
        waitingRestart = null;
        toRun();
      }
    }
  }, 0);
}

/**
 * @param {number} pid
 */
function killAsync(pid) {
  return new Promise((resolve, reject) => {
    kill(pid, (err, children) => {
      if (err) return reject(err);
      return resolve(children);
    });
  });
}

async function runMainProcess() {
  if (restartInProgress) {
    waitingRestart = () => runMainProcess();
    return pid;
  }
  restartInProgress = true;
  if (pid) {
    try {
      await killAsync(pid)
      process.kill(pid, 'SIGKILL');
    } catch (error) {}
  }
  const port = +(process.env.PORT || '');
  if (port && !Number.isNaN(port)) {
    await new Promise((resolve) => {
      setTimeout(resolve, 100);
    });
    const free = await checkport(port);
    if (!free) {
      console.log('Killing port', port);
      await killport(+port).catch((err) => console.error('Error: (Kill port):', err?.message || err));
    }
  }
  console.log(' ');
  console.log(`<h3 style="padding: 0;margin: 0">Command: ${command.cmd} ${command.args.join(' ')}</h3>`);
  const spawned = spawn(command.cmd, command.args, { cwd: pathfs.resolve('.'), shell: platform() === 'win32', env: process.env });
  pid = spawned.pid;
  spawned.stdout.on('data', (data) => {
    console.log(data.toString('utf-8'));
  });
  spawned.stderr.on('data', (data) => {
    console.error(data.toString('utf-8'));
  });
  restartInProgress = false;
  return spawned.pid;
}

function watchDeps(watchableDeps, cb = (
  /** @type {import('workspace-tools').PackageInfos[number]} */packageInfo,
) => packageInfo) {
  const call = debounce((packageInfo) => cb(packageInfo), 100);
  watch(rootPath, { ignored: (path) => ignored.some((f) => f.test(path)) , ignoreInitial: true }).on('all', (event, path) => {
    const packageInfos = getPackageInfos('.');
    const packageChanged = Object.keys(packageInfos)
      .filter((f) => {
        if (!watchableDeps.find((w) => w.name === f)) return false;
        const changedPath = path.replace(`${rootPath}/`, '').replaceAll('/', '-');
        const packageName = f.replace('@runeya/', '').replace('@runeya/', '');
        return changedPath.startsWith(packageName);
      }).pop();
    if (packageChanged) {
      call(packageInfos[packageChanged]);
    }
  }).on('ready', () => console.log('ready'));
}

function getWatchableDeps(path) {
  const currentPackage = getPackageInfoFromPath(path);
  if (currentPackage) {
    const ignoreDependencies = [];
    if (currentPackage.name === '@runeya/servers-server') {
      ignoreDependencies.push('@runeya/fronts-app');
      ignoreDependencies.push('@runeya/modules-plugins-loader-front');
      ignoreDependencies.push((name) => name.endsWith('-front'));
    }
    const depsName = getDependencies(currentPackage?.name, ignoreDependencies);
    const deps = depsName.map((depName) => getPackageInfos('.')[depName]);
    return deps;
  }
  return [];
}

function getDependencies(packageName, ignoreDependencies = [], recursiveAggr = []) {
  if(!packageName) return recursiveAggr;
  console.log('getDependencies', packageName);
  const dependencies = (getPackageInfos(rootPath)[packageName].dependencies || {});
  const devDependencies = (getPackageInfos(rootPath)[packageName].devDependencies || {});
  const deps = [
    ...Object.keys(dependencies),
    ...Object.keys(devDependencies),
  ].filter((f) => (f.startsWith('@runeya') || f.startsWith('@runeya')) && (dependencies[f] === 'workspace:*' || devDependencies[f] === 'workspace:*'));
  deps.forEach((f) => {
    const isIgnored = !ignoreDependencies.some((ignoreCondition) => (
      typeof ignoreCondition === 'function'
        ? ignoreCondition(f)
        : f === ignoreCondition
    ));
    if (!recursiveAggr.includes(f) && isIgnored) {
      recursiveAggr.push(f);
      getDependencies(f, ignoreDependencies, recursiveAggr)
    }
  });
  return recursiveAggr;
}

function getPackageInfoFromPath(path) {
  const packagesInfos = getPackageInfos(rootPath);
  return Object.values(packagesInfos)
    .filter((f) => {
      const packageName = path.replace(`${rootPath}/`, '').replaceAll('/', '-');
      return packageName.startsWith(f.name.replace('@runeya/', ''))
        || packageName.startsWith(f.name.replace('@runeya/', ''));
    }).pop();
}

function checkport(_port) {
  return new Promise((resolve) => {
    const s = net.createServer();
    s.once('error', () => {
      s.close();
      resolve(false);
    });
    s.once('listening', () => {
      console.log(_port);
      resolve(true);
      s.close();
    });
    s.listen(_port);
  });
}
