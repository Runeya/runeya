const plugins = {
  bugs: require('@runeya/modules-bugs-backend'),
  base64: require('@runeya/modules-base64-backend'),
  configuration: require('@runeya/modules-configuration-backend'),
  devOps: require('@runeya/modules-dev-ops-backend'),
  diff: require('@runeya/modules-diff-backend'),
  documentation: require('@runeya/modules-documentation-backend'),
  finder: require('@runeya/modules-finder-backend'),
  git: require('@runeya/modules-git-backend'),
  github: require('@runeya/modules-github-backend'),
  globalScripts: require('@runeya/modules-global-scripts-backend'),
  httpClient: require('@runeya/modules-http-client-backend'),
  jsonFormatter: require('@runeya/modules-json-formatter-backend'),
  jwt: require('@runeya/modules-jwt-backend'),
  kanban: require('@runeya/modules-kanban-backend'),
  logs: require('@runeya/modules-logs-backend'),
  mongo: require('@runeya/modules-mongo-backend'),
  nodeRepl: require('@runeya/modules-node-repl-backend'),
  npm: require('@runeya/modules-npm-backend'),
  openai: require('@runeya/modules-openai-backend'),
  regex: require('@runeya/modules-regex-backend'),
  sqlBeautifier: require('@runeya/modules-sql-beautifier-backend'),
  toolbox: require('@runeya/modules-toolbox-backend'),
  uuid: require('@runeya/modules-uuid-backend'),
  help: require('@runeya/modules-help-backend'),
  openapi: require('@runeya/modules-openapi-backend'),
  vscode: require('@runeya/modules-vscode-backend'),
  docker: require('@runeya/modules-docker-backend'),
  nodered: require('@runeya/modules-workflows-backend'),
};
module.exports = Object.keys(plugins).reduce((acc, key) => {
  if (plugins[key].enabled) acc[key] = plugins[key];
  return acc;
}, {});
