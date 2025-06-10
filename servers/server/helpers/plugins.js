const plugins = require('@runeya/modules-plugins-loader-backend');
const Stack = require('../models/stack');
const { default: axios } = require('axios');
const { tmpdir } = require('node:os');
const path = require('node:path');
const { existsSync } = require('node:fs');
const { writeFile, mkdir, readFile, cp, rm, readdir, appendFile } = require('node:fs/promises');
const { spawn } = require('node:child_process');
const dbs = require('./dbs');
const HTTPError = require('@runeya/common-express-http-error');
const args = require('./args');
const tar = require('tar');
const dbConfig = dbs.getDb('plugins', {encrypted: false, defaultData: []});
const dbPublicPlugins = dbs.getDb('public-plugins', {encrypted: false, defaultData: []});
const { sockets } = require('@runeya/common-socket-server');
const stack = require('../models/stack');
const debounce = require('debounce');

/** @type {import('chokidar')}  This is just a development depency*/
// @ts-ignore
let chokidar = null;
if(process.env.NODE_ENV === 'HFBXdZMJxLyJoua28asEaxRixJ6LriR7FnRzX6pwA7pFjZ') {
  chokidar = require('chokidar');
}

/** @type {import('express').Router[]} */
const routes = [];
/** @type {PluginSM[]} */
const forService = [];
/** @type {Record<string, PluginSM[]>} */
const allPlugins = {};

/** @type {Record<string, any>} */
const loadedPlugins = {};


/** @type {Record<string, any>} */
const themes = {};

Object.keys(plugins)
  .map((key) => plugins[/** @type {keyof (typeof plugins)} */(key)])
  .forEach((plugin) => {
    if (!plugin) return null;
    if (plugin.placements?.includes('service')) forService.push(plugin);
    if (plugin.routes) {
      routes.push(plugin.routes(Stack));
      delete plugin.routes;
    }
    (plugin.placements || []).forEach((p) => {
      const position = typeof p === 'string' ? p : p.position;
      if (!position) return null;
      if (!allPlugins[position]) allPlugins[position] = [];
      if (!allPlugins[position].includes(plugin)) {
        allPlugins[position].push({
          ...plugin,
          placements: (plugin.placements || []).filter((_p) => typeof _p !== 'string' && _p.position === position),
        });
      }
      return null;
    });
    return plugin;
  });

async function install(remotePath, force = false, insert = true) {
  const rootPath = args.rootPath;
  if(!existsSync(rootPath)) await mkdir(rootPath, { recursive: true });
  const pluginsPath = path.resolve(args.runeyaConfigPath, 'plugins');
  if(!existsSync(pluginsPath)) await mkdir(pluginsPath, { recursive: true });
  const packageTmpPath = path.resolve(tmpdir(), `runeya-plugin-${Date.now()}`);
  if(!existsSync(packageTmpPath)) await mkdir(packageTmpPath, { recursive: true });
  const packageTmpFilePath = `${packageTmpPath}.tar.gz`;

  const { data } = await axios.get(remotePath, { responseType: 'arraybuffer' });
  await writeFile(packageTmpFilePath, data);
  await tar.extract({ file: packageTmpFilePath, cwd: packageTmpPath });
  const config = JSON.parse(await readFile(path.join(packageTmpPath, 'package.json'), 'utf8'));
  const plugin = await getInstalledPlugin(config.name, config.version);
  console.log('Installing', config.name + '@' + config.version)

  if(plugin && !force) {
    throw new HTTPError('Plugin already installed', '400.68746854743512');
  }
  if(insert) await dbConfig.alasql.delete(`name='${config.name}'`);
  const diskPath = path.resolve(pluginsPath, config.name);
  if(existsSync(diskPath)) await rm(diskPath, { recursive: true, force: true });
  await cp(path.resolve(packageTmpPath), diskPath, { recursive: true });
  if(insert) {
    await dbConfig.alasql.insertOne({
      name: config.name,
      version: config.version,
      config,
      remotePath,
    });
  }
  if(config.runeya.entries.backend) {
    try {
      const child = await spawn('npm i --omit=dev', {cwd: path.dirname(path.resolve(diskPath, config.runeya.entries.backend)), shell: true})
      const installPromise = new Promise((resolve, reject) => {
        const installLog = []
        child.stdout.on('data', (data) => {
          installLog.push(data.toString())
          console.log(`[${config.name}:${config.version}]`, data.toString())
        })
        child.stderr.on('data', (data) => {
          installLog.push(data.toString())
          console.error(`[${config.name}:${config.version}]`, data.toString())
        })
        child.on('close', (code) => {
          if(code !== 0) {
            reject(installLog.join('\n'))
          } else {
            resolve(installLog.join('\n'))
          }
        });
      })
      await installPromise
    } catch (error) {
      console.error(error)
      sockets.emit('plugins:install:error', config.name, error)
      return null;
    }
  }
  await loadPlugin(config.name);
  sockets.emit('plugins:installed', {
    name: config.name,
    version: config.version,
    config,
    remotePath,
  });
}

async function init() {
  const plugins = await getInstalledPlugins();
  await Promise.all(plugins.map(async (plugin) => {
    try {
      await loadPlugin(plugin.name);
    } catch (error) {
      console.error(error)
    }
  }));
}

async function getInstalledPlugins() {
  let installedPlugins = []

  if(process.env.NODE_ENV === 'HFBXdZMJxLyJoua28asEaxRixJ6LriR7FnRzX6pwA7pFjZ' && process.env.PLUGIN_ONLY_PRODUCTION !== 'true') {
    const pluginsPath = path.resolve(__dirname, '../../../plugins')
    const pluginsDir = await readdir(pluginsPath)
    await Promise.all(pluginsDir.map(async (pluginDirName) => {
      const pluginPath = path.resolve(pluginsPath, pluginDirName)
      const packageJsonPath = path.resolve(pluginPath, 'package.json')
      const config = JSON.parse(await readFile(packageJsonPath, 'utf8'));
      installedPlugins.push( {
        "name": config.name,
        "version": "development",
        "config": {
          ...config,
          runeya: {
            ...config.runeya,
            entries: {
              ...config.runeya.entries,
              front: {
                ...config.runeya.entries.front,
                ...(config.runeya.entries.front?.js ? {js: './front/dist/index.umd.js'} : {}),
              },
            },
          },
        },
        "remotePath": "http://127.0.0.1:5469/api/plugins/download/%40runeya%2Fplugins-uuid/1.0.8"
      })
    }))
  } else {
    const privatePlugins = await dbConfig.alasql.simpleSelect({});
    const publicPlugins = await dbPublicPlugins.alasql.simpleSelect({});
    installedPlugins = [...privatePlugins, ...publicPlugins.map((plugin) => ({
      ...plugin,
      availableForAll: true,
    }))];
    installedPlugins = installedPlugins.filter((plugin) => plugin.version !== 'development');
  }

  const sortedPlugins = installedPlugins.sort((a, b) => a.name.localeCompare(b.name))
  return sortedPlugins
}
async function getInstalledPlugin(name, version) {
  const [plugin] = (await getInstalledPlugins()).filter((plugin) => plugin.name === name);
  if(version && plugin?.version !== version) return null;
  return plugin;
}

async function uninstall(name) {
  const [plugin] = await dbConfig.alasql.simpleSelect({where: `name='${name}'`});
  const [publicPlugin] = await dbPublicPlugins.alasql.simpleSelect({where: `name='${name}'`});
  
  if (!plugin && !publicPlugin) {
    throw new HTTPError('Plugin not found', '404.plugin.not.found');
  }
  const diskPath = path.resolve(args.runeyaConfigPath, 'plugins', name);
  if (diskPath && existsSync(diskPath)) {
    await rm(diskPath, { recursive: true, force: true });
  }
  if(plugin) {
    await dbConfig.alasql.delete(`name='${name}'`);
  } else {
    await dbPublicPlugins.alasql.delete(`name='${name}'`);
  }
  sockets.emit('plugins:uninstalled', {
    name,
  });
  return { success: true, message: 'Plugin uninstalled successfully' };
}

async function changeAvailability(name, availableForAll) {
  let [plugin] = await dbConfig.alasql.simpleSelect({where: `name='${name}'`});
  if(!plugin) {
    [plugin] = await dbPublicPlugins.alasql.simpleSelect({where: `name='${name}'`});
  }
  if (!plugin) {
    throw new HTTPError('Plugin not found', '404.plugin.not.found');
  }
  if(availableForAll) {
    await dbPublicPlugins.alasql.insertOne(plugin);
    await dbConfig.alasql.delete(`name='${name}'`);
  } else {
    await dbPublicPlugins.alasql.delete(`name='${name}'`);
    await dbConfig.alasql.insertOne(plugin);
  }
  return { success: true, message: 'Plugin availability changed successfully' };
}

async function registerRoutes(router) {
  routes.forEach((route) => router.use(route));
  router.get('/api/plugins/themes', async (req, res) => {
    res.json(Object.keys(themes).reduce((acc, theme) => {
      themes[theme].forEach((t, i) => {
        acc[theme.replace('@', '').replace('/', '-') + '-' + i] = {
          ...t,
          group: theme + '-' + t.group,
        };
      });
      return acc;
    }, {}));
  });
}

async function call(pluginName, method, args) {
  if(!loadedPlugins[pluginName]) await loadPlugin(pluginName);
  const loadedPlugin = loadedPlugins[pluginName];
  if(!loadedPlugin) throw new HTTPError('Plugin not found', '404.plugin.not.found');
  return loadedPlugin[method](...args);
}

// Add this helper function to clear plugin cache recursively
function clearPluginCache(pluginPath) {
  const pluginDir = path.dirname(pluginPath);
  
  // Find all cached modules that belong to this plugin directory
  Object.keys(require.cache).forEach(cachedPath => {
    if (cachedPath.startsWith(pluginDir)) {
      console.log('Clearing cache for:', cachedPath);
      delete require.cache[cachedPath];
    }
  });
}
async function loadPlugin(pluginName) {
  try {
    const plugin = await getInstalledPlugin(pluginName);
    let backendPath;
    let themePath;

    const diskPath = path.join(args.runeyaConfigPath, 'plugins', pluginName);
    if(!existsSync(diskPath)) {
      console.error('Plugin not found on disk, reinstalling', pluginName, '...')
      await install(plugin.remotePath, true, false);
    }

    if(process.env.NODE_ENV === 'HFBXdZMJxLyJoua28asEaxRixJ6LriR7FnRzX6pwA7pFjZ' && process.env.PLUGIN_ONLY_PRODUCTION !== 'true' && pluginName.startsWith('@runeya/')) {
      const pluginPath = path.resolve(__dirname,`../../../plugins/${pluginName.replace('@runeya/plugins-', '')}`)
      const frontPath = path.resolve(pluginPath, 'front') 
      const frontPathDist = path.resolve(`${frontPath}/dist`)
      backendPath = path.resolve(pluginPath, 'backend/index.js') 
      themePath = path.resolve(pluginPath, 'theme/index.js') 

      let frontWatcher;
      if(existsSync(frontPath) && existsSync(frontPathDist) && existsSync(backendPath)) {
        const debouncedFrontWatcher = debounce(async () => {
          sockets.emit('plugins:front:building', pluginName);
          console.log('Front changed', pluginName)
        }, 1000);
        frontWatcher = chokidar.watch(frontPath, {ignored: frontPathDist, ignoreInitial: true}).on('all', debouncedFrontWatcher);
      }

      let frontDistWatcher;
        if(existsSync(frontPathDist)) {
        const debouncedFrontDistWatcher = debounce(async (a,b,c) => {
          sockets.emit('plugins:front:changed', pluginName);
          console.log('Front dist changed', pluginName)
        }, 1000);
        frontDistWatcher = chokidar.watch(frontPathDist, {ignoreInitial: true}).on('all', debouncedFrontDistWatcher);
      }

      let backendWatcher;
      if(existsSync(backendPath)) {
        const debouncedBackendWatcher = debounce(async () => {
          await frontWatcher.close()
          await frontDistWatcher.close()
          await backendWatcher.close()
          loadPlugin(pluginName);
          console.log('Backend changed', pluginName)
        }, 1000);
        backendWatcher = chokidar.watch(path.dirname(backendPath), {ignoreInitial: true}).on('all', debouncedBackendWatcher);
      } else {
        backendPath = null;
      }

      let themeWatcher;
      if(existsSync(themePath)) {
        const debouncedThemeWatcher = debounce(async () => {
          if(frontWatcher) await frontWatcher.close()
          if(frontDistWatcher) await frontDistWatcher.close()
          if(themeWatcher) await themeWatcher.close()
          loadPlugin(pluginName);
          console.log('Theme changed', pluginName)
        }, 1000);
        themeWatcher = chokidar.watch(path.dirname(themePath), {ignoreInitial: true}).on('all', debouncedThemeWatcher);
      } else {
        themePath = null;
      }
    } else {
      if(plugin.config.runeya.entries.backend) {
        backendPath = path.resolve(args.rootPath,'.runeya', 'plugins', pluginName, plugin.config.runeya.entries.backend || '') 
      }
      if(plugin.config.runeya.entries.theme) {
        themePath = path.resolve(args.rootPath,'.runeya', 'plugins', pluginName, plugin.config.runeya.entries.theme || '') 
      }
    }

    if(backendPath) {
      clearPluginCache(backendPath);
      try {
        const loadedPlugin = safeRequire(backendPath)
        loadedPlugins[pluginName] = await loadedPlugin(stack, {
          socket: {
            emit: (event, ...args) => {
              sockets.emit(encodeURIComponent(pluginName) + '-' + event, ...args);
            },
            on: (event, callback) => {
              sockets.on(encodeURIComponent(pluginName) + '-' + event, callback);
            },
            off: (event, callback) => {
              sockets.off(encodeURIComponent(pluginName) + '-' + event, callback);
            },
          },
        });
      } catch (/** @type {any} */ error) {
        console.error(`[${plugin.name}@${plugin.version}]`, error)
        console.log(Object.getOwnPropertyNames(error))
        setTimeout(() => {
          sockets.emit('plugins:loading:error', pluginName, {...error, message: error?.message?.split('\n')?.[0]})
        }, 1000);
        return null;
      }
    }

    if(themePath) {
      clearPluginCache(themePath);
      const loadedTheme = require(themePath)
      themes[pluginName] = await loadedTheme(stack, {
        socket: {
          emit: (event, ...args) => {
            sockets.emit(encodeURIComponent(pluginName) + '-' + event, ...args);
          },
          on: (event, callback) => {
            sockets.on(encodeURIComponent(pluginName) + '-' + event, callback);
          },
          off: (event, callback) => {
            sockets.off(encodeURIComponent(pluginName) + '-' + event, callback);
          },
        },
      });
    }

    return loadedPlugins[pluginName];
    } catch (error) {
      console.error(error?.message || error)
    }
  
}

function safeRequire(path) {
  try {
    return require(path);
  } catch (err) {
    console.error('Erreur dans safeRequire:', err);
    throw err;
  }
}

async function frontFile(pluginName) {
  const plugin = await getInstalledPlugin(pluginName);
  return await readFile(path.join(args.runeyaConfigPath, 'plugins', pluginName,  plugin.config.runeya.entries.front.js), 'utf8');
}

module.exports = {
  install,
  frontFile,
  call,
  uninstall,
  getInstalledPlugins,
  getInstalledPlugin,
  registerRoutes,
  changeAvailability,
  init,
  forService,
  ...allPlugins,
  routes,
};

/**
 * @typedef {import('@runeya/modules-plugins-loader-front/src/views').PluginSM<unknown>} PluginSM
 */
