const open = require('open');
const pathfs = require('path');
const ws = require('workspace-tools');
const { readFile } = require('fs/promises');
const { readFileSync, existsSync } = require('fs');
const HTTPError = require('@runeya/common-express-http-error');
const { exec } = require('child_process');

const execAsync = (cmd, options) => {
  return new Promise((res, rej) => {
    exec(cmd, options, (err, stdout, stderr) => {
      if (err) return rej(stderr || err);
      return res(stdout);
    });
  });
};


/** @param {import('@runeya/common-typings').Runeya} runeya */
const VscodeExtension = (runeya) => {
  let vsixPath;
  if(existsSync(pathfs.resolve(__dirname, './dist/runeya.vsix'))) {
    vsixPath = pathfs.resolve(__dirname, './dist/runeya.vsix');
  } else if(existsSync(pathfs.resolve(__dirname, './runeya.vsix'))) {
    vsixPath = pathfs.resolve(__dirname, './runeya.vsix');
  } else {
    throw new HTTPError('vsix not found', 400);
  }

  return {
    install: async () => {
      await execAsync(`code --install-extension ${vsixPath}`, { cwd: __dirname });
      return 'ok';
    },

    uninstall: async () => {
      await execAsync('code --uninstall-extension runeya.runeya', { cwd: __dirname });
      return 'ok';
    },
    openUrl: async (url) => {
      await open(url);
      return 'ok';
    },
    getServicesFromFile: async (file) => {
      try {
        if (!file) throw new HTTPError('file params is required', 400);
        const packageRoot = ws.findPackageRoot(file);
        let projectRoot;
        try { projectRoot = ws.findProjectRoot(file); } catch (error) { projectRoot = packageRoot; }
        if (!packageRoot) throw new HTTPError('no package found', 400);
        if (!projectRoot) throw new HTTPError('no package found', 400);
        const monorepo = packageRoot !== projectRoot;
        if (monorepo) {
          const packageInfos = await ws.getPackageInfosAsync(projectRoot);
          const { dependents: dependentsMap } = ws.createDependencyMap(packageInfos);
          const packageJSON = JSON.parse(await readFile(pathfs.resolve(packageRoot, './package.json'), 'utf-8'));
          const dependents = [
            ...(dependentsMap.get(packageJSON.name) || []),
          ];
          const services = runeya.getServices().filter((service) => {
            const servicePackageNames = [
              service.getRootPath(),
              ...service.commands.map((cmd) => cmd.spawnOptions?.env),
            ]
              .flat(100)
              .filter((a, i, arr) => (
                a
                && !arr.slice(0, i).includes(a)
                && a.toString() !== projectRoot
                && existsSync(pathfs.resolve(a.toString(), './package.json'))
              ))
              .map((path) => JSON.parse(readFileSync(pathfs.resolve(path?.toString() || '', './package.json'), 'utf-8')).name);
            return dependents.some((packageName) => servicePackageNames.includes(packageName))
              || servicePackageNames.includes(packageJSON.name);
          });
          return services;
        } else {
          const packageRoot = ws.findPackageRoot(file);
          let projectRoot;
          try {
            projectRoot = ws.findProjectRoot(file);
          } catch (error) { projectRoot = packageRoot; }
          if (!packageRoot) throw new HTTPError('no package found', 400);
          if (!projectRoot) throw new HTTPError('no package found', 400);
          const services = runeya.getServices().filter((service) => {
            const servicePaths = [
              service.getRootPath(),
              ...service.commands.map((cmd) => cmd.spawnOptions?.env),
            ]
              .flat(100)
              .filter((a, i, arr) => (
                a
                && !arr.slice(0, i).includes(a)
                && existsSync(pathfs.resolve(a.toString(), './package.json'))
              ));
            return servicePaths.includes(projectRoot);
          });
          return services;
        }
      } catch (error) {
        console.error(error);
        return [];
      }
    },
    download: async () => {
      return (req, res) => {
        res.sendFile(vsixPath);
      };
    },
  }
};

module.exports = VscodeExtension;

