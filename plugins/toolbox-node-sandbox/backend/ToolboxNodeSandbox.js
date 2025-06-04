const express = require('express');
const { v4 } = require('uuid');
const { mkdir, writeFile } = require('fs/promises');
const { writeFileSync, readFileSync, unlinkSync } = require('fs');
const pathfs = require('path');
const { mkdirSync, existsSync } = require('fs');
const { spawn } = require('child_process');
const { promisify } = require('util');
const setTimeoutAsync = promisify(setTimeout);
const prettier = require('prettier');
const { exec } = require('child_process');
const execAsync = promisify(exec);
const path = require('path');
const fs = require('fs').promises;

const router = express.Router();
const homedir = require('os').homedir();

// Configuration
const MAX_SCRIPT_SIZE = 1024 * 1024; // 1MB
const MAX_EXECUTION_TIME = 30000; // 30 seconds
const MAX_MEMORY = 512 * 1024 * 1024; // 512MB
const ALLOWED_MODULES = ['fs', 'path', 'os', 'util', 'crypto', 'buffer', 'stream', 'events'];

const confDir = pathfs.resolve(homedir, '.runeya');
if (!existsSync(confDir)) mkdirSync(confDir);
const confPath = pathfs.resolve(confDir, 'node-repl');
if (!existsSync(confPath)) writeFileSync(confPath, '{}', 'utf-8');
const conf = JSON.parse(readFileSync(confPath, 'utf-8'));

// Dossier pour les packages npm
const packagesDir = pathfs.resolve(confDir, 'node-repl-packages');
if (!existsSync(packagesDir)) mkdirSync(packagesDir);

/** @param {import('@runeya/common-typings').Runeya} runeya */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ToolboxNodeSandbox = (runeya, {socket}) => {
  // Nettoyage des fichiers temporaires au démarrage
  cleanupTempFiles().catch(console.error);

  function save() {
    try {
      writeFileSync(confPath, JSON.stringify(conf, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving configuration:', err);
    }
  }

  return {
    // Execute script in a room
    async executeScript(room, script) {
      try {
        // Validation du script
        validateScript(script);

        if (!conf.chat?.[room]) {
          if (!conf.chat) conf.chat = {};
          if (!conf.chat?.[room]) conf.chat[room] = {};
        }
        conf.chat[room].script = script;

        // Initialiser le package.json de la room si nécessaire
        await initRoomPackageJson(room);

        // Créer un dossier temporaire unique pour cette session
        const sessionId = v4();
        const sessionDir = path.join(__dirname, 'sandbox-node-repl', sessionId);
        await fs.mkdir(sessionDir, { recursive: true });

        // Créer le fichier de script
        const scriptPath = path.join(sessionDir, 'script.js');
        await fs.writeFile(scriptPath, script);

        let result = '';
        let error = null;
        let timeoutId;

        // Utiliser les variables d'environnement personnalisées si elles existent
        const customEnv = conf.chat[room]?.env || {};
        const env = {
          ...process.env,
          ...customEnv,
          NODE_OPTIONS: `--max-old-space-size=${MAX_MEMORY / 1024 / 1024}`,
          NODE_PATH: path.join(getRoomPackagesDir(room), 'node_modules'),
        };

        const spawnCmd = spawn('node', [scriptPath], {
          env,
          cwd: sessionDir,
        });

        // Timeout pour limiter le temps d'exécution
        timeoutId = setTimeout(() => {
          spawnCmd.kill();
          error = new Error('Script execution timed out');
        }, MAX_EXECUTION_TIME);

        socket.emit('repl:update', { clear: true });

        spawnCmd.stdout.on('data', (data) => {
          const output = data.toString('utf-8');
          socket.emit('repl:update', { msg: output, type: 'stdout' });
          result += output;
        });

        spawnCmd.stderr.on('data', (data) => {
          const output = data.toString('utf-8');
          socket.emit('repl:update', { msg: output, type: 'stderr' });
          result += output;
        });

        spawnCmd.on('error', (err) => {
          error = err;
          socket.emit('repl:update', { msg: `Error: ${err.message}`, type: 'error' });
        });

        spawnCmd.on('close', (code) => {
          clearTimeout(timeoutId);
          socket.emit('repl:update', { close: true });

          try {
            conf.chat[room].result = result;
            conf.chat[room].lastExecution = new Date().toISOString();
            conf.chat[room].error = error ? error.message : null;
            save();
          } catch (err) {
            console.error('Error saving result:', err instanceof Error ? err.message : err);
          }

          // Nettoyage du dossier temporaire
          try {
            require('fs').rmSync(sessionDir, { recursive: true, force: true });
          } catch (err) {
            console.error('Error cleaning up temporary directory:', err instanceof Error ? err.message : err);
          }
        });

        save();
        return sessionId;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        socket.emit('repl:update', { 
          msg: `Error: ${errorMessage}`, 
          type: 'error',
          clear: true 
        });
        throw new Error(errorMessage);
      }
    },

    // Get list of rooms
    async getRooms() {
      return Object.keys(conf?.chat || {});
    },

    // Create a new room
    async createRoom(room) {
      if (!conf?.chat?.[room]) {
        if (!conf?.chat) conf.chat = {};
        if (!conf?.chat?.[room]) conf.chat[room] = {};
      }
      save();
      return Object.keys(conf?.chat || {});
    },

    // Delete a room
    async deleteRoom(room) {
      if (conf?.chat?.[room]) {
        delete conf.chat[room];
        // Nettoyer les packages de la room
        await cleanupRoomPackages(room);
      }
      save();
      return Object.keys(conf?.chat || {});
    },

    // Get room data
    async getRoom(room) {
      return conf?.chat?.[room];
    },

    // Format code
    async formatCode(code) {
      try {
        if (!code) {
          throw new Error('No code provided');
        }

        const formatted = await prettier.format(code, {
          parser: 'babel',
          semi: true,
          singleQuote: true,
          trailingComma: 'es5',
          printWidth: 80,
          tabWidth: 2,
          useTabs: false,
          bracketSpacing: true,
          arrowParens: 'avoid',
        });

        return { formatted };
      } catch (err) {
        throw new Error(err instanceof Error ? err.message : String(err));
      }
    },

    // Save environment variables
    async saveEnvironmentVariables(room, env) {
      try {
        if (!room || !env) {
          throw new Error('Room and environment variables are required');
        }

        if (!conf.chat?.[room]) {
          if (!conf.chat) conf.chat = {};
          if (!conf.chat?.[room]) conf.chat[room] = {};
        }

        conf.chat[room].env = env;
        save();
        return { success: true };
      } catch (err) {
        throw new Error(err instanceof Error ? err.message : String(err));
      }
    },

    // Get environment variables
    async getEnvironmentVariables(room) {
      try {
        return conf?.chat?.[room]?.env || {};
      } catch (err) {
        throw new Error(err instanceof Error ? err.message : String(err));
      }
    },

    // Install npm package
    async installPackage(packageName, room) {
      try {
        if (!packageName || !room) {
          throw new Error('Package name and room are required');
        }

        // Vérifier si npm est disponible
        const npmAvailable = await checkNpmAvailable();
        if (!npmAvailable) {
          throw new Error('npm is not available in the system PATH. Please install Node.js and npm first.');
        }

        // Initialiser le package.json de la room si nécessaire
        const packageJsonPath = await initRoomPackageJson(room);
        const roomDir = getRoomPackagesDir(room);

        // Installer le package dans l'environnement de la room
        await execAsync(`npm install ${packageName}`, { cwd: roomDir });
        
        // Lire le package.json mis à jour
        const installedPackageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
        return installedPackageJson.dependencies || {};
      } catch (error) {
        console.error('Error installing package:', error);
        throw new Error(error.message);
      }
    },

    // List installed packages
    async getPackages(room) {
      try {
        const packageJsonPath = pathfs.resolve(getRoomPackagesDir(room), 'package.json');
        
        try {
          const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
          return packageJson.dependencies || {};
        } catch (err) {
          // Si le fichier n'existe pas, retourner un objet vide
          return {};
        }
      } catch (error) {
        console.error('Error listing packages:', error);
        throw new Error(error.message);
      }
    },

    // Uninstall npm package
    async uninstallPackage(room, name) {
      try {
        if (!name || !room) {
          throw new Error('Package name and room are required');
        }

        // Vérifier si npm est disponible
        const npmAvailable = await checkNpmAvailable();
        if (!npmAvailable) {
          throw new Error('npm is not available in the system PATH. Please install Node.js and npm first.');
        }

        const roomDir = getRoomPackagesDir(room);
        const packageJsonPath = pathfs.resolve(roomDir, 'package.json');

        // Désinstaller le package
        await execAsync(`npm uninstall ${name}`, { cwd: roomDir });
        
        // Lire le package.json mis à jour
        const updatedPackageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
        return updatedPackageJson.dependencies || {};
      } catch (error) {
        console.error('Error uninstalling package:', error);
        throw new Error(error.message);
      }
    }
  };
};

module.exports = ToolboxNodeSandbox;

// Fonction pour obtenir le dossier des packages d'une room
function getRoomPackagesDir(room) {
  return pathfs.resolve(packagesDir, room);
}

// Fonction pour initialiser le package.json d'une room
async function initRoomPackageJson(room) {
  const roomDir = getRoomPackagesDir(room);
  if (!existsSync(roomDir)) {
    mkdirSync(roomDir, { recursive: true });
  }
  
  const packageJsonPath = pathfs.resolve(roomDir, 'package.json');
  if (!existsSync(packageJsonPath)) {
    await fs.writeFile(packageJsonPath, JSON.stringify({ dependencies: {} }, null, 2), 'utf-8');
  }
  return packageJsonPath;
}

// Fonction pour nettoyer les packages d'une room
async function cleanupRoomPackages(room) {
  const roomDir = getRoomPackagesDir(room);
  if (existsSync(roomDir)) {
    try {
      await fs.rm(roomDir, { recursive: true, force: true });
    } catch (err) {
      console.error(`Error cleaning up packages for room ${room}:`, err);
    }
  }
}

// Fonction utilitaire pour nettoyer les fichiers temporaires
async function cleanupTempFiles() {
  const sandboxDir = pathfs.resolve(__dirname, 'sandbox-node-repl');
  if (existsSync(sandboxDir)) {
    const files = await promisify(require('fs').readdir)(sandboxDir);
    for (const file of files) {
      try {
        await promisify(require('fs').unlink)(pathfs.join(sandboxDir, file));
      } catch (err) {
        console.error(`Error cleaning up file ${file}:`, err);
      }
    }
  }
}

// Fonction pour valider le script
function validateScript(script) {
  if (script.length > MAX_SCRIPT_SIZE) {
    throw new Error(`Script too large. Maximum size is ${MAX_SCRIPT_SIZE / 1024 / 1024}MB`);
  }

  // Vérifier les imports dangereux
  const dangerousImports = script.match(/require\(['"](?!${ALLOWED_MODULES.join('|')})['"]\)/g);
  if (dangerousImports) {
    throw new Error('Script contains unauthorized module imports');
  }

  return true;
}

// Vérifier si npm est disponible
async function checkNpmAvailable() {
  try {
    await execAsync('npm --version');
    return true;
  } catch (error) {
    return false;
  }
}
