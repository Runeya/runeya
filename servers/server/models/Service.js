/* eslint-disable func-names */
/// <reference path="@runeya/common-typings.d.ts">
const os = require('os');
const { spawn } = require('child_process');
const killport = require('kill-port');
const URL = require('url');
const path = require('path');
const PromiseB = require('bluebird');
const dayjs = require('dayjs');
const { v4 } = require('uuid');
const { existsSync, readFileSync } = require('fs');
const kill = require('tree-kill');
const axios = require('axios').default;
const pathfs = require('path');
const net = require('net');
// eslint-disable-next-line import/no-extraneous-dependencies
const { sockets } = require('@runeya/common-socket-server');
const { mkdir, writeFile } = require('fs/promises');
const { cloneDeep, over } = require('lodash');
const CreateInterface = require('../helpers/readline');
const { stripAnsi, ansiconvert, unescapeAnsi } = require('../helpers/ansiconvert');
const isWindows = require('../helpers/isWindows');
const { execAsync } = require('../helpers/exec');
const { humanStringToKey, replaceEnvs } = require('../helpers/stringTransformer.helper');
const dbs = require('../helpers/dbs');
const Environment = require('./Environment');
const ParserModel = require('./Parser');

const userInfo = os.userInfo();
const { gid, uid, username } = userInfo;

/** @type {Record<string, {cmd: string, args: string[]}>} */
const alias = {
  ls: { cmd: 'ls', args: ['--color=force'] },
  gco: { cmd: 'git', args: ['checkout'] },
};

/**
 * @param {import('@runeya/common-typings').NonFunctionProperties<Service>} service
 * @param {import('./stack')} Stack
 */
function Service(service, Stack, { isUpdate } = { isUpdate: false }) {
  return (async () => {
    this.Stack = Stack;
    /** @type {LogMessage[]} */
    this.queue = service.queue || [];
    this.stopQueue = false
    if (!isUpdate) {
      this.processQueue()
    }
    /** @type {string} */
    this.label = service.label || '';
    /** @type {string} */
    this.description = service.description || '';
    /**
     * @type {{
     *  home: string,
     *  remote: string,
     * }}
     * */
    this.git = {
      home: service.git?.home || '',
      remote: service.git?.remote || '',
    };
    /** @type {string} */
    this.documentation = service.documentation || '';
    /** @type {string} */
    this.openapiURL = service.openapiURL || '';
    /** @type {string} */
    this.url = service.url || '';
    /** @type {string} */
    this.rootPath = service.rootPath || '.';
    /** @type {string[]} */
    this.urls = service.urls || [];
    /** @type {string[]} */
    this.groups = service.groups || [];
    /** @type {string[]} */
    this.parsers = service.parsers || [
      'runeya-parser-debug',
      'runeya-parser-jsons',
      'runeya-parser-links',
    ];
    /** @type {boolean} */
    this.enabled = service.enabled || false;
    /** @type {boolean} */
    this.crashed = service.crashed || false;
    /**
     * @type {{
     *  enabled: boolean
     *  name: string,
     *  user?: string,
     *  build: string,
     *  volumes: string[],
     *  ignoreVolumes: string[],
     *  sharedVolume: string,
     *  ports: string[],
     *  noHostUser: true
     *  noChangeWorkDir: true,
     *  customPid?: ({cmd, args, pid})=> Promise<number | null>
     *  bootstrap: {commands: Array<{user: string, cmd: string, entrypoint:string}>}
     * }}
     */
    // @ts-ignore
    this.container = service.container || {};
    if (this.container) {
      this.container.name = humanStringToKey(this.label);
      if (!this.container.volumes?.length) this.container.volumes = [];
      if (!this.container.build) this.container.build = '';
      this.container.ports = this.container.ports || [];
      this.container.sharedVolume = this.container.sharedVolume || '~/.runeya';
      this.container.ignoreVolumes = this.container.ignoreVolumes?.length
        ? this.container.ignoreVolumes.filter((f) => !f.startsWith(this.container?.sharedVolume || ''))
        : [];
      if (!this.container.bootstrap) this.container.bootstrap = { commands: [] };
      if (!this.container.bootstrap.commands) this.container.bootstrap.commands = [];
    }
    /** @type {boolean} */
    this.exited = service.exited || false;
    /** @type {{[key:string]: {[key:string]: {value: string, override: string, systemOverride?: string, prefix?: string, suffix?: string}}}} */
    this.envs = service.envs || {}
    /**
     * @type {{
     *  id: string,
     *  spawnArgs: string[],
     *  spawnCmd: string,
     *  spawnOptions: SpawnOptions
     *  effectiveParsers: ParserModel[]
     *  parsers: string[]
     * }[]}
     * */
    this.commands = service.commands || [];
    /**
     * @type {{
     *  id: string,
     *  spawnArgs: string[],
     *  spawnCmd: string,
     *  spawnOptions: SpawnOptions
     *  effectiveParsers: ParserModel[]
     *  parsers: string[]
     * }[]}
     * */
    this.shortcuts = service.shortcuts || [];
    /** @type {LogMessage[]} */
    this.store = service.store || [];
    /** @type {import('child_process').ChildProcess[]} */
    this.pids = service.pids || [];
    /** @type {number | null} */
    this.lastDatePrinted = service.lastDatePrinted || null;

    /**
     * @type {{
     *  enabled: boolean,
     *  url: string,
     *  interval: string,
     *  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
     *  returnCode: number,
     *  responseText: string,
     *  timeout: number,
     *  startAfter: number
     * }}
     * */
    this.health = service.health || {
      enabled: false,
      url: '',
      interval: '',
      method: 'GET',
      returnCode: 200,
      responseText: '',
      timeout: 0,
      startAfter: 0,
    };
    const environments = await Environment.all();
    const overrides = await dbs.getDb(`overrides/${this.label}-envs`).read();
    // Load variables from db and envs
    if (!isUpdate) {
      environments.forEach((environment) => {
        const envs = this.envs[environment.label] || {}
        Object.keys(envs).forEach((key) => {
          const env = envs[key]
          const tag = extractTag(env.value);
          if (tag) envs[key].override = `{{${tag}_RUNEYA_OVERRIDE}}`;
          const override = overrides[environment.label]?.[key];
          if (!env || !override) return
          envs[key].override = override.replace('STACK_MONITOR_OVERRIDE', 'RUNEYA_OVERRIDE')
        });
      });
    }
    /** @type {Record<string, string>} */
    this.meta = service.meta || {};
    await PromiseB.map(this.commands || [], async (command) => {
      // @ts-ignore
      command.effectiveParsers = await PromiseB.map([
        ...(this.parsers || []),
        ...(command.parsers || []),
      ], (parserId) => ParserModel.find(parserId)).filter((a) => !!a);
    });
    await this.save() // migration stuff
    return this;
  })();
}
Service.prototype.getRootPath = function () {
  return replaceEnvs(this.rootPath);
};

Service.prototype.processQueue = function() {
  if (this.queue.length) {
    const messages = this.queue.splice(0, this.queue.length);
    sockets.emit('logs:update', messages);
  }
  if(this.stopQueue) return
  setTimeout(() => {this.processQueue()}, 25);
}

Service.prototype.save = async function () {
  const obj = this.toStorage();
  const overrides = {};
  if (obj.envs) {
    await PromiseB.map(Object.keys(obj.envs), (environmentLabel) => {
      if (!overrides[environmentLabel]) overrides[environmentLabel] = {};
      if (obj.envs && obj.envs[environmentLabel]) {
        Object.keys(obj.envs[environmentLabel]).forEach((key) => {
          const env = obj.envs?.[environmentLabel]?.[key];
          if (env) {
            overrides[environmentLabel][key] = env.override;
            env.systemOverride = undefined;
            env.override = undefined;
          }
        });
      }
    });
  }
  await dbs.getDb(`overrides/${this.label}-envs`).write(overrides);
  await dbs.getDb(`services/${this.label}`).write(obj);
};

Service.prototype.delete = async function () {
  await dbs.getDb(`overrides/${this.label}-envs`).delete();
  await dbs.getDb(`services/${this.label}`).delete();
};

Service.load = async function (label, Stack) {
  const db = await dbs.getDb(`services/${label}`).read()
  return new Service(db, Stack);
};

/** @param {string} path */
Service.prototype.loadCustomEnv = function (path) {
  const dotEnvPath = pathfs.resolve(path, '.env');
  if (existsSync(dotEnvPath) && readFileSync(dotEnvPath, { encoding: 'utf-8' }).trim()) {
    console.log(`! A .env will override your ${this.label} service !`);
    return require('dotenv').parse(readFileSync(dotEnvPath, 'utf-8'));
  }
  return null;
};

Service.prototype.exportInApi = function () {
  const res = { ...this };
  // @ts-ignore
  delete res.pids;
  // @ts-ignore
  delete res.store;
  // @ts-ignore
  delete res.Stack;
  return res;
};
/** @return {Partial<import('@runeya/common-typings').NonFunctionProperties<Service>>} */
Service.prototype.toStorage = function () {
  const service = cloneDeep({
    label: this.label,
    commands: this.commands,
    description: this.description,
    git: this.git,
    groups: this.groups,
    url: this.url,
    rootPath: this.rootPath,
    openapiURL: this.openapiURL,
    health: this.health,
    urls: this.urls,
    parsers: this.parsers,
    container: this.container,
    meta: this.meta,
    envs: this.envs,
    shortcuts: this.shortcuts
  });
  return service;
};

Service.prototype.restart = async function (options = {}) {
  await this.kill();
  
  // If debug mode is requested, add debug flags to commands
  if (options.debug === 'node' && this.commands?.length) {
    console.log(`[DEBUG] Restarting ${this.label} with Node.js debug flags`);
    
    // Backup original commands
    const originalCommands = cloneDeep(this.commands);
    
    // Add debug flags to commands
    this.commands.forEach((command, index) => {
      if (!command.spawnCmd) return;
      
      const finalSpawnCmd = command.spawnCmd;
      const finalSpawnArgs = [...(command.spawnArgs || [])];
      
      console.log(`[DEBUG] Processing command ${index}:`);
      console.log(`[DEBUG] - spawnCmd: "${finalSpawnCmd}"`);
      console.log(`[DEBUG] - spawnArgs: [${finalSpawnArgs.map(a => `"${a}"`).join(', ')}]`);
      
      if (finalSpawnCmd === 'node' || (typeof finalSpawnCmd === 'string' && (finalSpawnCmd.startsWith('node ') || finalSpawnCmd.endsWith('/node') || finalSpawnCmd.endsWith('\\node')))) {
          console.log(`[DEBUG] → Detected Node.js command`);
          
          // For commands like "node test", we need to split and reconstruct
          if (finalSpawnCmd.includes(' ') && finalSpawnArgs.length === 0) {
            console.log(`[DEBUG] → Command has spaces, splitting: "${finalSpawnCmd}"`);
            const parts = finalSpawnCmd.split(' ');
            const nodeCmd = parts[0]; // "node"
            const restArgs = parts.slice(1); // ["test"]
            
            const hasInspectFlag = restArgs.some(arg => arg.includes('--inspect'));
            console.log(`[DEBUG] → Has inspect flag already: ${hasInspectFlag}`);
            
            if (!hasInspectFlag) {
              // Use --inspect-brk to pause at start, then resume programmatically
              command.spawnCmd = nodeCmd;
              command.spawnArgs = ['--inspect-brk=0.0.0.0:9229', ...restArgs];
              console.log(`[DEBUG] ✅ Reconstructed Node.js command: ${command.spawnCmd} ${command.spawnArgs.join(' ')}`);
            } else {
              console.log(`[DEBUG] ⚠️ Inspect flag already present, skipping`);
            }
          } else {
            // Normal case: node command with separate args
            const hasInspectFlag = finalSpawnArgs.some(arg => arg.includes('--inspect'));
            console.log(`[DEBUG] → Has inspect flag already: ${hasInspectFlag}`);
            
            if (!hasInspectFlag) {
              // Use --inspect-brk to pause at start, then resume programmatically  
              command.spawnArgs = ['--inspect-brk=0.0.0.0:9229', ...finalSpawnArgs];
              console.log(`[DEBUG] ✅ Added --inspect-brk to Node.js command: ${finalSpawnCmd} ${command.spawnArgs.join(' ')}`);
            } else {
              console.log(`[DEBUG] ⚠️ Inspect flag already present, skipping`);
            }
          }
      } else if (finalSpawnCmd === 'npm' || finalSpawnCmd === 'yarn' || finalSpawnCmd === 'pnpm' || finalSpawnCmd === 'bun') {
        // npm/yarn/pnpm/bun commands - use multiple strategies for debug
        command.spawnOptions = command.spawnOptions || {};
        command.spawnOptions.env = command.spawnOptions.env || {};
        
        let currentNodeOptions = command.spawnOptions.env.NODE_OPTIONS || '';
        
        // Check if our specific debug config is already present
        const hasOurDebugConfig = currentNodeOptions.includes('--inspect-brk=0.0.0.0:9229');
        
        if (!hasOurDebugConfig) {
          // Strategy 1: Use NODE_OPTIONS (traditional approach)
          currentNodeOptions = currentNodeOptions
            .replace(/--inspect[^\s]*/g, '')  // Remove --inspect, --inspect-brk, --inspect=port, etc.
            .replace(/\s+/g, ' ')             // Clean up multiple spaces
            .trim();
          
          command.spawnOptions.env.NODE_OPTIONS = `${currentNodeOptions} --inspect-brk=0.0.0.0:9229`.trim();
          
          // Strategy 2: For npm, also try to use --node-options flag as backup
          if (finalSpawnCmd === 'npm' && finalSpawnArgs.length > 0) {
            // Add --node-options as additional strategy for npm
            const hasNodeOptionsFlag = finalSpawnArgs.some(arg => arg.includes('--node-options'));
            if (!hasNodeOptionsFlag) {
              // Insert --node-options right after the npm subcommand (run, start, etc.)
              const subcommandIndex = finalSpawnArgs.findIndex(arg => arg === 'run' || arg === 'start' || arg === 'test');
              if (subcommandIndex >= 0 && subcommandIndex < finalSpawnArgs.length - 1) {
                finalSpawnArgs.splice(subcommandIndex + 2, 0, '--node-options=--inspect-brk=0.0.0.0:9229');
                command.spawnArgs = finalSpawnArgs;
                console.log(`[DEBUG] ✅ Added --node-options flag to npm command: ${finalSpawnCmd} ${finalSpawnArgs.join(' ')}`);
              }
            }
          }
          
          console.log(`[DEBUG] ✅ Added debug config for ${finalSpawnCmd}:`);
          console.log(`[DEBUG] - NODE_OPTIONS: ${command.spawnOptions.env.NODE_OPTIONS}`);
          if (finalSpawnCmd === 'npm') {
            console.log(`[DEBUG] - Command: ${finalSpawnCmd} ${finalSpawnArgs.join(' ')}`);
          }
        } else {
          console.log(`[DEBUG] ✅ NODE_OPTIONS already has correct debug config for ${finalSpawnCmd}: ${currentNodeOptions}`);
        }
      } else {
        // Other commands - try NODE_OPTIONS as fallback
        command.spawnOptions = command.spawnOptions || {};
        command.spawnOptions.env = command.spawnOptions.env || {};
        
        const currentNodeOptions = command.spawnOptions.env.NODE_OPTIONS || '';
        if (!currentNodeOptions.includes('--inspect')) {
          command.spawnOptions.env.NODE_OPTIONS = `${currentNodeOptions} --inspect-brk=0.0.0.0:9229`.trim();
          console.log(`[DEBUG] Added NODE_OPTIONS to other command ${finalSpawnCmd}: ${command.spawnOptions.env.NODE_OPTIONS}`);
        }
      }
    });
    
    // Launch with debug flags
    await this.launch();
    
    // Auto-setup debugger following official chrome-remote-interface docs
    // Use longer delay for package managers as they need time to start the underlying Node.js process
    const hasPackageManager = this.commands.some(cmd => 
      cmd.spawnCmd === 'npm' || 
      cmd.spawnCmd === 'yarn' || 
      cmd.spawnCmd === 'pnpm' || 
      cmd.spawnCmd === 'bun'
    );
    // Longer delay for package managers, especially with ts-node/transpilation
    const setupDelay = hasPackageManager ? 5000 : 1000;
    
    setTimeout(async () => {
      console.log(`[DEBUG] Setting up debugger for ${this.label} (delay: ${setupDelay}ms)...`);
      
      // Retry logic for debugger connection - more patient for ts-node/compilation
      let retries = hasPackageManager ? 6 : 3;  // More retries for package managers
      let client = null;
      
      while (retries > 0 && !client) {
        try {
          const CDP = require('chrome-remote-interface');
          client = await CDP({ port: 9229 });
          console.log(`[DEBUG] ✅ Connected to debugger on attempt ${(hasPackageManager ? 7 : 4) - retries}`);
          break;
        } catch (connectionError) {
          retries--;
          const errorMessage = connectionError instanceof Error ? connectionError.message : String(connectionError);
          console.log(`[DEBUG] Connection attempt failed (${retries} retries left):`, errorMessage);
          
          if (retries > 0) {
            // Longer wait for package managers (ts-node needs time to compile)
            const waitTime = hasPackageManager ? 2000 : 1000;
            console.log(`[DEBUG] Waiting ${waitTime}ms before next attempt...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
          }
        }
      }
      
              if (!client) {
        console.log('[DEBUG] ❌ Failed to connect to debugger after all retries');
        
        // Check if port 9229 is actually in use
        const portIsFree = await checkport(9229);
        console.log(`[DEBUG] Port 9229 status: ${portIsFree ? 'free' : 'occupied'}`);
        
        // If port is free, Node.js process never started with debug flags
        if (portIsFree) {
          console.log('[DEBUG] 🔍 Diagnosing why Node.js process didn\'t start with debug flags:');
          
          // Check if service is actually running
          const isServiceRunning = this.pids.length > 0 && this.pids.some(p => !p.killed);
          console.log(`[DEBUG] - Service has running processes: ${isServiceRunning}`);
          
          if (isServiceRunning) {
            console.log('[DEBUG] - Process is running but not in debug mode');
            console.log('[DEBUG] - Possible causes:');
            console.log('[DEBUG]   • NODE_OPTIONS not inherited by subprocess');
            console.log('[DEBUG]   • Script doesn\'t use Node.js directly');
            console.log('[DEBUG]   • Process overrides NODE_OPTIONS');
            console.log('[DEBUG]   • Check your package.json script content');
          } else {
            console.log('[DEBUG] - Process is not running - may have crashed on startup');
          }
        }
        
        const reason = !portIsFree 
          ? 'Debugger port is occupied but CDP connection failed - check if it\'s a Node.js process'
          : 'Node.js process not running in debug mode - check package.json script and NODE_OPTIONS inheritance';
        
        sockets.emit('debug:disconnected', {
          service: this.label,
          reason
        });
        return;
      }
      
      try {
        const { Debugger, Runtime } = client;
        
        try {
          console.log('[DEBUG] Connected to debugger for initial setup');
          
          // Notify frontend that debugger is connected
          sockets.emit('debug:connected', {
            service: this.label,
            debugPort: 9229
          });
          
          // Set up event listener BEFORE enabling debugger
          Debugger.on('paused', async (params) => {
            const { hitBreakpoints, reason, callFrames, data } = params;
            console.log('[DEBUG] Script paused!');
            console.log('[DEBUG] Reason:', reason);
            
            if (callFrames && callFrames.length > 0) {
              const topFrame = callFrames[0];
              
              let debugInfo = {
                reason,
                hitBreakpoints,
                location: {
                  scriptId: topFrame.location.scriptId,
                  line: topFrame.location.lineNumber + 1,
                  column: (topFrame.location.columnNumber || 0) + 1,
                  functionName: topFrame.functionName || '<global>',
                  url: topFrame.url || 'Eval Script',
                },
                sourceContext: [],
                variables: {}
              };
              
              // Get script source and url info
              if (topFrame.location.scriptId) {
                try {
                  const { scriptSource } = await Debugger.getScriptSource({
                    scriptId: topFrame.location.scriptId
                  });

                  console.log(JSON.stringify(['runeya', scriptSource],(_, v) => (typeof v === 'function' ? `[func]` : v)));
                  
                  const lines = scriptSource.split('\n');
                  const currentLine = topFrame.location.lineNumber;
                  const start = 0;
                  const end = lines.length;
                  
                  debugInfo.sourceContext = lines.slice(start, end).map((line, idx) => ({
                    number: start + idx + 1,
                    content: line,
                    current: start + idx === currentLine
                  }));
                  
                } catch (err) {
                  console.log('[DEBUG] Could not get source:', (err instanceof Error ? err.message : String(err)));
                }
              }
              
              // Get variables from scope chain
              try {
                for (const scope of topFrame.scopeChain) {
                  if (scope.type === 'local' || scope.type === 'global') {
                    const { result } = await Runtime.getProperties({
                      objectId: scope.object.objectId || '',
                      ownProperties: true
                    });

                    const filename = result.find(prop => prop.name === '__filename')
                    if(filename) debugInfo.location.url = filename.value?.value || filename.value
                    debugInfo.variables[scope.type] = result
                      .filter(prop => prop.name !== '__proto__' && !prop.name.startsWith('Symbol('))
                      .map(prop => ({
                        name: prop.name,
                        value: prop.value ? prop.value.value : prop.value,
                        type: prop.value ? prop.value.type : 'undefined',
                        description: prop.value ? prop.value.description : 'undefined'
                      }));
                  }
                }
              } catch (err) {
                console.error('[DEBUG] Could not get variables:', (err instanceof Error ? err.message : String(err)));
              }
              
              try {
                this.add('debugger encountered', { source: 'stdout', debugType:  'node', debug: debugInfo }, { pid: null, command: this.commands[0],  isMainProcess: true });
                sockets.emit('debug:paused', {
                  service: this.label,
                  debugInfo
                });
                console.log('[DEBUG] Sent debug:paused event to frontend');
              } catch (err) {
                console.error('[DEBUG] Could not send event to frontend:', (err instanceof Error ? err.message : String(err)));
              }
            }
          });
          
          // Following the official docs order:
          // 1. Start runtime if waiting (ESSENTIAL with --inspect-brk)
          await Runtime.runIfWaitingForDebugger();
          console.log('[DEBUG] Runtime started');
          
          // 2. Enable debugger - script will automatically pause at first debugger; statement
          await Debugger.enable();
          await Debugger.resume();
          console.log('[DEBUG] Debugger enabled - script should now be paused at first debugger; statement');
          
          // Handle disconnection
          client.on('disconnect', () => {
            console.log('[DEBUG] Debugger disconnected');
            sockets.emit('debug:disconnected', {
              service: this.label
            });
          });
          
          client.on('error', (err) => {
            console.log('[DEBUG] Debugger error:', err);
            sockets.emit('debug:disconnected', {
              service: this.label
            });
          });
        } catch (err) {
          console.error('[DEBUG] Setup error:', err.message || err);
          // Notify frontend that debugger connection failed
          sockets.emit('debug:disconnected', {
            service: this.label,
            reason: 'Debugger setup failed'
          });
        }
      } catch (error) {
        console.error('[DEBUG] Auto-setup failed (normal if no debugger):', error.message || error);
        // Notify frontend that debugger connection failed
        sockets.emit('debug:disconnected', {
          service: this.label,
          reason: 'Cannot connect to debugger (ECONNREFUSED or not available)'
        });
      }
    }, setupDelay);
    
    // Don't restore commands immediately - let them run with debug flags
    // The commands will be restored on next normal restart
    
    // Emit debug event with appropriate message based on command type
    const debugCommands = this.commands.filter(cmd => 
      cmd.spawnCmd === 'node' || 
      cmd.spawnCmd === 'npm' || 
      cmd.spawnCmd === 'yarn' || 
      cmd.spawnCmd === 'pnpm' || 
      cmd.spawnCmd === 'bun' ||
      (cmd.spawnOptions?.env?.NODE_OPTIONS && cmd.spawnOptions.env.NODE_OPTIONS.includes('--inspect'))
    );
    
    const commandTypes = [...new Set(debugCommands.map(cmd => cmd.spawnCmd))];
    const commandTypesStr = commandTypes.join(', ');
    
    sockets.emit('service:debug:started', {
      label: this.label,
      debugPort: 9229,
      message: `Service restarted with Node.js debug mode (${commandTypesStr}) - script will auto-start and pause at first debugger; statement`,
      commands: commandTypes
    });
    
    console.log(`[DEBUG] ${this.label} launched with debug flags. Will auto-setup in 3s, then use Next button for breakpoints`);
  } else {
    // Normal restart
    await this.launch();
  }
};

Service.prototype.sendHasBeenModified = function () {
  sockets.emit('conf:update', [this.label]);
};

Service.prototype.kill = async function (keepEnabled = false) {
  if (this.container?.enabled && this.container?.name) {
    await execAsync(`docker stop ${this.container.name}`, {}).catch(console.error);
    await execAsync(`docker rm ${this.container.name}`, {}).catch(console.error);
  } else {
    await PromiseB.map(this.pids, async (spawnedProcess) => {
      if (!spawnedProcess.pid) return;
      await killAsync(spawnedProcess.pid);
      spawnedProcess.kill('SIGKILL');
    });
    const urls = [...this.urls || [], this.url].filter((a) => a);
    if (urls.length) {
      await PromiseB.mapSeries(urls, async (url) => {
        const { port } = URL.parse(url);
        if (port && !Number.isNaN(+port)) {
          let free = false;
          for (let i = 0; i < 16; i += 1) {
            // eslint-disable-next-line no-await-in-loop
            await wait(100);
            // eslint-disable-next-line no-await-in-loop
            free = await checkport(+port);
            if (free) break;
          }
          if (!free) {
            await killport(+port).catch((err) => console.error('Error: (Kill port):', err?.message || err));
          }
        }
      });
    }
  }
  this.pids = [];
  sockets.emit('logs:clear', { label: this.label });
  this.store = [];
  await wait(100);
  this.enabled = keepEnabled;
  this.crashed = false;
  this.sendHasBeenModified();
};

Service.prototype.launch = async function () {
  this.store = [];
  await this.kill(true).catch(console.error);
  if(this.container?.enabled) {
    await this.buildDocker({isMainProcess: true})
  }
  if (this.commands?.length) {
    await PromiseB.map(this.commands, async (command) => {
      if (command?.spawnCmd) {
        await this.launchProcess(command);
      }
    });
  }
  this.enabled = true;
  this.sendHasBeenModified();
};

/**
 * @param {Buffer | string} data
 * @param {Partial<LogMessage>} logMessageOverride
 */
Service.prototype.add = async function (data, logMessageOverride, {
  pid, isMainProcess, command,
}) {
  const timestamp = Date.now();

  const ansiMsg = unescapeAnsi(data.toString());
  const stripMsg = stripAnsi(ansiMsg);
  const htmlMessage = ansiMsg ? ansiconvert.toHtml(ansiMsg) : '<br/>';
  /** @type {LogMessage} */
  let line = {
    pid,
    msg: htmlMessage,
    raw: stripMsg,
    timestamp,
    label: this.label,
    json: null,
    debug: null,
    ...logMessageOverride,
    id: v4(),
  };
  line = await PromiseB.reduce(command.effectiveParsers || [], async (line, parser) => {
    try {
      const result = await parser.transformFunction(line, this);
      if (!result?.id) {
        console.error(`It seems your parser "${parser.label}" not return correct value. Please verify or disable it..`);
        return line;
      }
      return result;
    } catch (err) {
      console.error('[PARSER]:', parser.label, ':', err);
      return line;
    }
  }, line);

  if (line.hide) return;

  if (line.source === 'stderr' && isMainProcess) {
    sockets.emit('alert', { label: this.label, message: line.raw.toString(), type: 'error', commandId: command?.id });
  }

  if (timestamp > (this.lastDatePrinted || Date.now()) + 2000) {
    const date = `🕑  ${dayjs().format('YYYY-MM-DD HH:mm:ss')}`;
    /** @type {LogMessage} */
    const line = {
      id: v4(), raw: date, label: this.label, msg: date, timestamp, isSeparator: true,
    };
    this.store.push(line);
    this.queue.push(line);
  }
  this.lastDatePrinted = Date.now();

  if (line.msg.length > 100000 && !line.msg.startsWith('["runeya"')) line.msg = line.msg.slice(0, 10000);
  this.store.push(line);
  if(this.store.length > 1000) this.store.shift();
  this.queue.push(line);
};

Service.prototype.launchProcess = async function (command, isMainProcess = true) {
  try {
    this.enabled = true;
    this.sendHasBeenModified();
    this.crashed = false;
    this.exited = false;
    let { cmd, args, options } = this.container.enabled
      ? await this.parseIncomingCommandDocker(command)
      : await this.parseIncomingCommand(command);
    if (!existsSync(options.cwd)) {
      this.crashed = true;
      this.exited = true;
      /** @type {LogMessage} */
      const launchMessage = {
        id: v4(),
        timestamp: Date.now(),
        label: this.label,
        pid: null,
        msg: `Path does not exists (${options.cwd})`,
        raw: `Path does not exists (${options.cwd})`,
        cmd: {
          cmd,
          args,
          options,
          status: 'exited',
        },
      };
      console.error(launchMessage.msg);
      this.add(launchMessage.msg, { source: 'stderr' }, { pid: null, command, isMainProcess });
      return {spawnProcess: null, launchMessage};
    }
    const spawnProcess = spawn(cmd, args, { ...options, detached: !isWindows });

    /** @type {number | undefined | null} */
    let pid = 0;
    pid = spawnProcess.pid;
    if (this.container?.customPid) {
      // cant wait for custom pid, because listeners should be attached fast after spawn call
      this.container.customPid({ pid: spawnProcess.pid, cmd, args })
        .then((_pid) => { pid = _pid; });
    }
    if (!this.pids) this.pids = [];
    this.pids.push(spawnProcess);
    // @ts-ignore
    spawnProcess.title = this.label;
    this.lastDatePrinted = Date.now();
    /** @type {LogMessage[]} */
    this.queue = [];
    new CreateInterface({
      input: spawnProcess.stdout,
      emitAfterNoDataMs: 100,
    })
      .on('line', (message) => {
        this.add(message, { source: 'stdout' }, { isMainProcess, pid, command });
      });
    new CreateInterface({
      input: spawnProcess.stderr,
      emitAfterNoDataMs: 100,
    }).on('line', (message) => {
      this.add(message, { source: 'stderr' }, { isMainProcess, pid, command });
    });

    /** @type {LogMessage} */
    const launchMessage = {
      id: v4(),
      timestamp: Date.now(),
      label: this.label,
      pid,
      msg: `${cmd} ${args.join(' ')}`,
      raw: `${cmd} ${args.join(' ')}`,
      cmd: {
        cmd,
        args,
        options,
        status: 'running',
      },
    };
    spawnProcess.on('exit', (code, signal) => {
      if (code) {
        if (launchMessage.cmd) launchMessage.cmd.status = 'error';
        if (isMainProcess) {
          sockets.emit('service:crash', {
            label: this.label, code, signal, pid,
          });
          this.crashed = true;
        }
      } else if (launchMessage.cmd) {
        launchMessage.cmd.status = 'exited';
        if (isMainProcess) {
          this.exited = true;
        }
      }
      
      // If this was a debug process, notify that debugger is now disconnected
      const isDebugProcess = isMainProcess && (
        cmd === 'node' || 
        (cmd && cmd.includes('node')) || 
        cmd === 'npm' || 
        cmd === 'yarn' || 
        cmd === 'pnpm' || 
        cmd === 'bun' ||
        (command.spawnOptions?.env?.NODE_OPTIONS && command.spawnOptions.env.NODE_OPTIONS.includes('--inspect'))
      );
      
      if (isDebugProcess) {
        console.log(`[DEBUG] Process with debug capabilities has exited: ${cmd} (${code ? 'crashed' : 'normal exit'})`);
        sockets.emit('debug:disconnected', {
          service: this.label,
          reason: code ? `Process crashed (exit code: ${code})` : 'Process exited normally',
          command: cmd
        });
      }
      
      sockets.emit('service:exit', {
        label: this.label, code, signal, pid,
      });
      sockets.emit('logs:update:lines', [launchMessage]);
    });

    const date = `🕑  ${dayjs().format('YYYY-MM-DD HH:mm:ss')}`;
    /** @type {LogMessage} */
    const line = {
      id: v4(), raw: date, label: this.label, msg: date, timestamp: this.lastDatePrinted, isSeparator: true,
    };
    this.store.push(line, launchMessage);
    sockets.emit('logs:update', [line, launchMessage]);
    if (isMainProcess) {
      setTimeout(() => {
        this.launchHealthChecker(spawnProcess);
      }, this.health.startAfter || 0);
      sockets.emit('service:start', {
        label: this.label, pid,
      });
    }

    return {
      launchMessage,
      spawnProcess,
    };
  } catch (error) {
    /** @type {LogMessage} */
    const launchMessage = {
      id: v4(),
      timestamp: Date.now(),
      label: this.label,
      pid: null,
      msg: `ERROR: ${error?.message || error}`,
      raw: `ERROR: ${error?.message || error}`,
      cmd: {
        cmd: command.spawnCmd,
        args: command.spawnArgs,
        options: command.spawnOptions,
        status: 'exited',
      },
    };
    const date = `🕑  ${dayjs().format('YYYY-MM-DD HH:mm:ss')}`;
    const line = {
      id: v4(), raw: date, label: this.label, msg: date, timestamp: this.lastDatePrinted, isSeparator: true,
    };
    sockets.emit('logs:update', [line, launchMessage]);
    throw error;
  }
};

/**
   *
   * @param {import('child_process').ChildProcessWithoutNullStreams} spawnProcess
   */
Service.prototype.launchHealthChecker = async function (spawnProcess) {
  if ((!spawnProcess.pid && !this.container?.name) || !this.health?.enabled) return;
  const healthy = await axios({
    method: this.health.method || 'GET',
    url: this.health.url || this.url,
    headers: {Accept: '*/*'},
    timeout: +(this.health.timeout || 0),
    validateStatus: (status) => status === (+(this.health.returnCode || 200)),
  })
    .then(({ data: response }) => {
      if (this.health.responseText && this.health.responseText !== JSON.stringify(response)) {
        return false;
      }
      return true;
    })
    .catch(() => false);
  if (!healthy && !this.crashed) {
    this.crashed = true;
    sockets.emit('service:healthcheck:down', { label: this.label, pid: spawnProcess.pid });
  } else if (healthy && this.crashed) {
    this.crashed = false;
    sockets.emit('service:healthcheck:up', { label: this.label, pid: spawnProcess.pid });
  }
  await wait(+(this.health.interval || 1000));
  this.launchHealthChecker(spawnProcess);
};

/**
   *
   * @param {number} pid
   * @param {string} message
   */
Service.prototype.respondToProcess = function (pid, message) {
  const process = this.pids.find((process) => process.pid === pid);
  if (!process) return console.error(`Pid (${pid}) not found`);
  process.stdin?.write(`${message.trim()}\n`);

  /** @type {LogMessage} */
  const line = {
    id: v4(),
    raw: `${message.trim()}\n`,
    label: this.label,
    msg: `${message.trim()}\n`,
    timestamp: Date.now(),
    prompt: true,
    pid,
  };
  this.store.push(line);
  sockets.emit('logs:update', [line]);
  return null;
};

/**
   * @param {number} pid
   * @param {boolean} forceKill
   */
Service.prototype.terminate = function (pid, forceKill = false) {
  const processFound = this.pids.find((process) => process.pid === pid);
  if (!processFound) return console.error(`Pid (${pid}) not found`);
  if (processFound.pid) {
    if (isWindows) process.kill(processFound.pid, 'SIGKILL');
    else process.kill(-processFound.pid, forceKill ? 'SIGKILL' : 'SIGTERM');
  }
  return null;
};

Service.prototype.enable = function () {
  this.enabled = true;
  this.sendHasBeenModified();
};

Service.prototype.disable = function () {
  this.enabled = false;
  this.sendHasBeenModified();
};

Service.prototype.getGlobalEnvs = async function (environmentLabel) {
  const globalEnvironment = await Environment.find(environmentLabel);
  return (label) => {
    const tag = this.extractTag(label);
    if (tag) {
      return globalEnvironment?.envs[tag] ?? '';
    }
    return label;
  };
};

Service.prototype.buildEnvs = async function (
  environmentLabel,
) {
  const globalEnvironment = await Environment.find(environmentLabel)
  if(!globalEnvironment) return {}
  const extendedEnvironments = await globalEnvironment.getExtendedEnvironments()
  const environmentsKeys = new Map()
  const searchEnv = (label, env) => {
    const tag = this.extractTag(label);
    if (tag) {
      return env[tag] ?? '';
    }
    return label;
  };
  extendedEnvironments.map(extendedEnvironment => {
    Object.keys(this.envs[extendedEnvironment.label] || {}).forEach(key => {
      const env = this.envs[extendedEnvironment.label][key]
      if(!environmentsKeys.has(key)) {
        for (let i = 0; i < extendedEnvironments.length; i++) {
          let occurrence = searchEnv(env.systemOverride, extendedEnvironments[i].envs) || searchEnv(env.override, extendedEnvironments[i].envs) || searchEnv(env.value, extendedEnvironments[i].envs)
          if (occurrence) occurrence = `${env.prefix || ''}${occurrence || ''}${env.suffix || ''}`
          const value = occurrence
          if(value) {
            environmentsKeys.set(key, value)
            return 
          }
        }
      }
    });
  });
  return ([...environmentsKeys]).reduce((agg, [key, value]) => {
    agg[key] = value
    return agg
  }, {})
};

Service.prototype.extractTag = function (field) {
  const extractedTag = /{{(.*)}}/gi.exec(field)?.[1]?.trim();
  return extractedTag;
};

Service.prototype.parseIncomingCommandDocker = async function (command) {
  let { spawnCmd, spawnArgs = [], spawnOptions = { envs: [] } } = command;
  const isAlive = await execAsync(`docker inspect --format {{.State.Pid}}  ${this.container.name}`, {})
    .then((pid) => pid.trim() !== '0')
    .catch(() => false);
  const cmd = 'docker'
  const args = isAlive 
    ? ['exec', this.container.name, spawnCmd, ...spawnArgs]
    : [
      'run',
      '--rm',
      ...await this.getDockerEnvsArgs(), ...await this.getDockerVolumesArgs(), ...await this.getDockerPorts(),
      '--network', 'host',
      '--name', this.container.name,
      this.container.name,
      'sh', `-c '${spawnCmd} ${spawnArgs.join(' ')}'`
    ]
  const cwd = pathfs.resolve(replaceEnvs(spawnOptions.cwd || this.getRootPath() || '.'));
  const options = {
    cwd,
    shell: isWindows ? process.env.ComSpec : '/bin/sh',
  };
  return {cmd, args, options}
}

Service.prototype.parseIncomingCommand = async function (command) {
  const { spawnCmd, spawnArgs = [], spawnOptions = { envs: [] } } = command;
  let cmd = spawnCmd?.split(' ')?.[0];
  const argFromCmd = spawnCmd?.split(' ')?.slice(1).join(' ');
  let args = [argFromCmd, ...spawnArgs].filter((a) => a);

  const currentAlias = alias[cmd];
  if (currentAlias) {
    cmd = currentAlias?.cmd || cmd;
    args = [...(currentAlias?.args || []), ...args];
  }
  const cwd = pathfs.resolve(replaceEnvs(spawnOptions.cwd || this.getRootPath() || '.'));
  const options = {
    ...spawnOptions,
    cwd,
    shell: isWindows ? process.env.ComSpec : '/bin/sh',
    env: {
      ...process.env,
      ...await this.buildEnvs(this.Stack.getCurrentEnvironment()?.label)
    },
  };

  if (cmd.match(/[/\\]/g)) {
    cmd = path.resolve(options.cwd.toString(), cmd);
  }
  options.env = { ...process.env, ...options.env };
  return { cmd, args, options };
};

function replaceHome(str) {
  return str.startsWith('~')
    ? pathfs.resolve(os.homedir(), str.replace('~/', ''))
    : pathfs.resolve(str);
}

Service.prototype.getDockerVolumesArgs = async function () {
  const internalVolumeRootPath = replaceHome(this.container.sharedVolume)
  const volumesCmd = this.container.volumes.map((v) => {
    let [external, internal] = v.split(':');
    if (external) external = pathfs.resolve(replaceHome(replaceEnvs(external)));
    if (internal) internal = pathfs.resolve(replaceHome(replaceEnvs(internal)));
    return ['-v', `"${external}:${internal || external}"`];
  });
  volumesCmd.push(...await PromiseB.map(this.container.ignoreVolumes, async (ignoredVolume) => {
    const volumePath = pathfs.join(internalVolumeRootPath, `ignored-volume-${humanStringToKey(this.label)}`, ignoredVolume);
    if (!existsSync(volumePath)) await mkdir(volumePath, { recursive: true }); // Pre create folders with host uid,gid to prevent docker to create as root user
    return ['-v', `"${volumePath}:${ignoredVolume}"`];
  }).filter((f) => !!f?.length));
  return volumesCmd.flat(1)
}
Service.prototype.getDockerPorts = async function () {
  const portsCmd = []
  this.container.ports.forEach(port => {
    portsCmd.push('-p', port)
  })
  return portsCmd.flat(1)
}

Service.prototype.getDockerEnvsArgs = async function () {
  const envs = await this.buildEnvs(this.Stack.getCurrentEnvironment()?.label)
  const envCmd = []
  Object.keys(envs).forEach(key => {
    envCmd.push('-e', `"${key}=${envs[key]}"`)
  })
  return envCmd
}

Service.prototype.launchDockerBuild = async function ({ isMainProcess }) {
  const internalVolumeRootPath = replaceHome(this.container.sharedVolume)
  const dockerFilePath = pathfs.resolve(internalVolumeRootPath, `Dockerfile.${this.container.name}`);
  const dockerContextPath = pathfs.resolve(internalVolumeRootPath, '.empty-context');
  const command = {
    spwanCmd: 'docker',
    spawnArgs: ['build', '-f', dockerFilePath, '-t', this.container?.name || '', dockerContextPath],
    spawnOptions: { cwd: internalVolumeRootPath, shell: isWindows ? true : '/bin/sh', env: process.env },
  };
  this.add('<i class="fab fa-docker" title="docker"></i> <i class="fas fa-hard-hat" title="build"></i> Building docker image...', { source: 'stdout' }, { pid: null, isMainProcess, command });
  this.add(`<i class="fab fa-docker" title="docker"></i> <i class="fas fa-hard-hat" title="build"></i> ${command.spwanCmd} ${command.spawnArgs?.join(' ')}}`, { source: 'stdout' }, { pid: null, isMainProcess, command });
  await new Promise((resolve, reject) => {
    const buildProcess = spawn(command.spwanCmd, command.spawnArgs, command.spawnOptions);
    new CreateInterface({
      input: buildProcess.stdout,
    })
      .on('line', (message) => {
        this.add(`<i class="fab fa-docker" title="docker"></i> <i class="fas fa-hard-hat" title="build"></i> ${message}`, { source: 'stdout' }, { isMainProcess, pid: buildProcess.pid, command });
      });
    new CreateInterface({
      input: buildProcess.stderr,
    }).on('line', (message) => {
      this.add(`<i class="fab fa-docker" title="docker"></i> <i class="fas fa-hard-hat" title="build"></i> ${message}`, { source: 'stdout' }, { isMainProcess, pid: buildProcess.pid, command });
    });
    buildProcess.on('exit', (code) => {
      if (code) {
        this.exited = true;
        this.crashed = true;
        return reject(code);
      }
      return resolve(null);
    });
  });
}


Service.prototype.launchDockerBootstrap = async function ({ isMainProcess }) {
  const volumesCmd = await this.getDockerVolumesArgs()
  const baseArgs = ['run', '--name', this.container.name, '--init', '--rm', , ...(isWindows ? [] : ['--user', this.container.user || `${uid}:${gid}`]), '--network', 'host', ...volumesCmd];
  if (this.container.bootstrap) {
    const envCmd = await this.getDockerEnvsArgs()
    await PromiseB.mapSeries(this.container.bootstrap.commands || [], async (command) => {
      await new Promise((resolve, reject) => {
        const entrypoint = command.entrypoint ? ['--entrypoint', `${command.entrypoint}`] : [];
        const userEntrypoint = command.user && !isWindows ? ['--user', `${command.user || this.container.user || `${uid}:${gid}`}`] : [];
        const bootstrapArgs = /**@type {String[]}*/([
          ...baseArgs,
          ...entrypoint.flat(1),
          ...userEntrypoint.flat(1),
          ...envCmd.flat(1),
          this.container.name,
          command.cmd,
        ].filter((a) => !!a));
        const commandBootstrap = {
          spawnCmd: 'docker',
          spawnArgs: bootstrapArgs,
          spawnOptions: { shell: isWindows ? process.env.ComSpec : '/bin/sh' },
        };
        this.add(`<i class="fab fa-docker" title="docker"></i> <i class="fas fa-hourglass-start" title="bootstrap"></i> ${commandBootstrap.spawnCmd} ${commandBootstrap.spawnArgs?.join(' ')}`, { source: 'stdout' }, { isMainProcess, pid: null, command: commandBootstrap });
        const bootstrapProcess = spawn(
          commandBootstrap.spawnCmd,
          commandBootstrap.spawnArgs,
          commandBootstrap.spawnOptions,
        );
        new CreateInterface({
          input: bootstrapProcess.stdout,
        })
          .on('line', (message) => {
            this.add(`<i class="fab fa-docker" title="docker"></i> <i class="fas fa-hourglass-start" title="bootstrap"></i> ${message}`, { source: 'stdout' }, { isMainProcess, pid: bootstrapProcess.pid, command: commandBootstrap });
          });
        new CreateInterface({
          input: bootstrapProcess.stderr,
        }).on('line', (message) => {
          this.add(`<i class="fab fa-docker" title="docker"></i> <i class="fas fa-hourglass-start" title="bootstrap"></i> ${message}`, { source: 'stderr' }, { isMainProcess, pid: bootstrapProcess.pid, command: commandBootstrap });
        });
        bootstrapProcess.on('exit', (code) => {
          if (code) return reject(code);
          return resolve(null);
        });
      });
    })
  }
}


/**
   * @param {{isMainProcess: boolean}} spawnCmd
   */
Service.prototype.buildDocker = async function ({
   isMainProcess
}) {
  const internalVolumeRootPath = replaceHome(this.container.sharedVolume)
  const dockerFilePath = pathfs.resolve(internalVolumeRootPath, `Dockerfile.${this.container.name}`);
  const dockerIgnoreFilePath = pathfs.resolve(internalVolumeRootPath, '.dockerignore');
  const dockerContextPath = pathfs.resolve(internalVolumeRootPath, '.empty-context');
  if (!existsSync(internalVolumeRootPath)) await mkdir(internalVolumeRootPath, { recursive: true });
  if (!existsSync(dockerContextPath)) await mkdir(dockerContextPath, { recursive: true });
  await writeFile(dockerFilePath, `${this.container.build || ''}`);
  await writeFile(dockerIgnoreFilePath, 'Dockerfile.*'.trim(), 'utf-8');
  await this.launchDockerBuild({ isMainProcess })
  await this.launchDockerBootstrap({ isMainProcess })
  this.container.customPid = async () => {
    const getPid = () => execAsync(`docker inspect --format {{.State.Pid}}  ${this.container?.name}`, {}).then((a) => a.trim()).catch(() => null);
    let pid = await getPid();
    if (!pid) {
      await wait(1000);
      pid = await getPid();
    }
    return pid && !Number.isNaN(+pid) ? +pid : null;
  };
};



const wait = (ms) => new Promise((resolve) => { setTimeout(resolve, ms); });
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

/** @param {number} _port */
function checkport(_port) {
  return new Promise((resolve) => {
    const s = net.createServer();
    s.once('error', () => {
      s.close();
      resolve(false);
    });
    s.once('listening', () => {
      resolve(true);
      s.close();
    });
    s.listen(_port);
  });
}

function extractTag(field) {
  const extractedTag = /{{(.*)}}/gi.exec(field)?.[1]?.trim();
  return extractedTag || '';
}

module.exports = Service;

/**
 * @typedef {import('child_process').ExecOptions &
 *  {overrideEnvs?: import('child_process').ExecOptions['env']}
 * } SpawnOptions
 */

/**
 * @typedef {Service} ServiceType
 */
/**
 * @typedef {{
 *  msg: string,
 *  raw: string,
 *  timestamp: number,
 *  prompt?: boolean,
 *  id: string,
 *  source?: 'stdout' | 'stderr'
 *  json?: Record<any, any> | any[] | null,
 *  debug?: Record<any, any> | any[] | null,
 *  isSeparator?: boolean,
 *  label: string,
 *  pid?: number | null,
 *  hide?: boolean,
 *  cmd?: {cmd: string, args: string[], options: import('child_process').ExecOptions, status: 'running' | 'error' | 'exited'},
 * }} LogMessage
 */

/**
 * @typedef {{
 *  id: string,
 *  transform: ((msg: LogMessage, service?: Service | null) => LogMessage)
 * }} Parser
 */
