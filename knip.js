/** @type {import('knip').KnipConfig} */
module.exports = {
  workspaces: {
    '.': {
      entry: ['./runScriptWithEnv.js', './watch.js', './stack.js'],
    },
    'fronts/app': {
      vue: true,
      ignore: ['node_modules/**/*'],
      ignoreDependencies: [
        '@fortawesome/fontawesome-free',
      ],
      entry: ['src/**/*.ts!', 'src/**/*.vue!', 'src/**/*.js!', 'babel.config.js'],
      project: ['**/*.ts!', '**/*.vue!', '**/*.js!'],
    },
    'modules/bugs/backend': {
      entry: ['checkJsFork.js'],
      project: ['**/*.ts!', '**/*.js!'],
    },
    'servers/server': {
      ignore: ['node_modules', 'bin/www'],
      entry: ['src/{index,cli,server}.js!', 'src/{index,cli,server}.ts!', '**/*.spec.(js|ts)', '**/*.test.(js|ts)', 'tsup.config.ts', '**/*/bin/www', 'helpers/cpuFork.js', 'tests/**/*.js'],
      project: ['**/*.ts!', '**/*.js!', '**/*/bin/www'],
    },
    'common/*': {
      entry: ['src/{index,cli,server}.js!', 'src/{index,cli,server}.ts!', '**/*.spec.(js|ts)', '**/*.test.(js|ts)', 'tsup.config.ts', 'src/walkerFork.js'],
      project: ['**/*.ts!', '**/*.js!'],
    },

    'plugins/*': {
      ignore: ['node_modules/**/*'],
      ignoreDependencies: [
      ],
      entry: ['backend/{index,cli,server}.js!', 'backend/{index,cli,server}.ts!', '**/*.spec.(js|ts)', '**/*.test.(js|ts)', 'backend/tsup.config.ts', 'front/vite.config.js', 'scripts/package.js', 'front/element.js', '**/*.js'],
      project: ['**/*.ts!', '**/*.js!',  '**/*.vue!',],
    },
    'modules/*/front': {
      vue: true,
      ignore: ['node_modules/**/*'],
      entry: ['src/**/*.vue'],
      project: ['**/*.ts!', '**/*.vue!', '**/*.js!'],
    },
  },
  ignoreDependencies: [
    '@runeya/common-retrigger-all-build',
    '@types/*',
    'vue-router',
    'knip',
    '@lerna-lite/*',
    'turbo',
    '@commitlint/*',
    'vue',
  ],
  ignore: [
    '**/*/jest.config.js',
  ],
  ignoreWorkspaces: [
    'common/jest',
    'fronts/docs',
  ],
};
