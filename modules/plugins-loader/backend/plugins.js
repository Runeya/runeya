const plugins = {
  bugs: require('@runeya/modules-bugs-backend'),
  configuration: require('@runeya/modules-configuration-backend'),
  documentation: require('@runeya/modules-documentation-backend'),
  finder: require('@runeya/modules-finder-backend'),
  git: require('@runeya/modules-git-backend'),
  github: require('@runeya/modules-github-backend'),
  logs: require('@runeya/modules-logs-backend'),
  npm: require('@runeya/modules-npm-backend'),
  toolbox: require('@runeya/modules-toolbox-backend'),
  help: require('@runeya/modules-help-backend'),
  openapi: require('@runeya/modules-openapi-backend'),
  docker: require('@runeya/modules-docker-backend'),
  nodered: require('@runeya/modules-workflows-backend'),
};

module.exports = Object.keys(plugins).reduce((acc, key) => {
  if (plugins[key].enabled) acc[key] = plugins[key];
  return acc;
}, {});
