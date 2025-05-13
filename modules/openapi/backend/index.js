/** @type {import('@runeya/modules-plugins-loader-front/src/views').PluginSM<null>} */
const plugin = {
  enabled: true,
  name: 'OpenApi',
  displayName: 'OpenApi',
  export: null,
  description: 'Open an open api json into swagger',
  icon: 'fas fa-network-wired',
  placements: ['service'],
  order: 4,
  hidden: (service) => {
    if (!service) return false;
    return !service?.openapiURL;
  },
  routes: require('./routes'),
};
module.exports = plugin;
