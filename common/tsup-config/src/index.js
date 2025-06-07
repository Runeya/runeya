import path from 'path';
import {
  readdir, rename,
  cp,
} from 'fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { rmSync } from 'node:fs';

// @ts-ignore
const __dirname = dirname(fileURLToPath(import.meta.url));

export const commonFiles = [
  path.resolve(__dirname, '../../../common/express-logger/src/logger-worker.js'),
  path.resolve(__dirname, '../../../common/express-logger/src/transport.js'),
];

export const copyFilesToRootPath = async (rootPath, dirPath = rootPath) => {
  let files = [];
  const items = await readdir(dirPath, { withFileTypes: true });
  const promises = items.map(async (item) => {
    const fullPath = path.join(dirPath, item.name);
    if (item.isDirectory()) {
      const nestedFiles = await copyFilesToRootPath(rootPath, fullPath);
      files = files.concat(nestedFiles);
    } else {
      await rename(fullPath, path.resolve(rootPath, path.basename(fullPath)));
    }
  });
  await Promise.all(promises);
  return files;
};

export const makeAllPackagesExternalPlugin = {
  name: 'make-all-packages-external',
  setup(build) {
    build.onResolve({ filter: /.*/ }, (args) => {
      if (!/^(#|\/|\.\/|\.\.\/)/.test(args.path)) { // If not begin with local path
        if (/@runeya\/*/.test(args.path)) {
          return { external: false };
        }
        return { external: true };
      }
      return { external: false };
    });
  },
};


/** @param {GetConfigArg} arg0 */
export const getDefaultConfig = (
  {
    entries, plugins, rootPath, copy,
  },
) => ({
  entry: [
    ...entries,
    ...commonFiles,
  ],
  clean: true,
  onSuccess: async () => {
    await copyFilesToRootPath(path.resolve(rootPath, 'dist'));
    if (copy?.length) {
      await Promise.all(copy.map(({ from, to }) => cp(from, to, { recursive: true })));
    }
  },
  esbuildPlugins: [
    makeAllPackagesExternalPlugin,
    ...(plugins || []),
  ],
  noExternal: [
    /@runeya\/.*/,
  ],
  sourcemap: true,
});

/** @param {GetConfigArg} arg0 */
export const getDefaultConfigWorker = (
  {
    entries, plugins, rootPath, copy,
  },
) => ({
  ...getDefaultConfig({
    entries, plugins, rootPath, copy,
  }),
  publicDir: './src/public',
});

/** @param {GetConfigArg} arg0 */
export const getDefaultConfigServer = (
  {
    entries, plugins, rootPath, copy,
  },
) => {
  const defaultConfig = getDefaultConfig({
    entries, plugins, rootPath, copy,
  });
  const esbuildPlugins = [
    ...defaultConfig.esbuildPlugins,
  ];
  return {
    ...defaultConfig,
    esbuildPlugins,

  };
};

export const getDefaultConfigPlugin = (
  {
    entries, plugins, rootPath, copy,
  },
) => {
  const distPath = process.env.DIST_PATH
  ? path.resolve(process.env.DIST_PATH)
  : path.resolve(rootPath, "dist")

  rmSync(distPath, {recursive: true, force: true})

  const defaultConfig = getDefaultConfig({
    entries, plugins, rootPath, copy,
  });
  const esbuildPlugins = [
    ...defaultConfig.esbuildPlugins,
  ];
  return {
    ...defaultConfig,
    bundle: true,
    clean: true,
    outDir: distPath,
    esbuildPlugins,
  };
};

/**
 *  @typedef {{entries: string[], plugins?:any[], rootPath: string, copy?: {from: string, to: string}[]}} GetConfigArg
 */
