const GlobalScripts = require('./GlobalScripts');

/** @type {import('@runeya/modules-plugins-loader-front/src/views').PluginSM<GlobalScripts>} */
const plugin = {
  enabled: true,
  name: 'Global scripts',
  displayName: 'Global scripts',
  description: 'Launch scripts and rule the world',
  icon: 'fas fa-columns',
  export: GlobalScripts,
  placements: [
    {
      position: 'dev-ops',
      label: 'Global scripts',
      iconText: '{}',
      goTo: { path: '/GlobalScripts' },
      active: 'GlobalScripts',
    },
  ],
  finder: (search, runeya) => {
    const scripts = runeya.globalScripts.getScripts()
      .filter((/** @type {*} */script) => script.label.toUpperCase()?.includes(search?.toUpperCase()));
    return [
      ...scripts.map((/** @type {*} */script) => ({
        icon: 'fas fa-cog',
        title: script.label,
        group: 'Global scripts',
        description: '',
        secondaryTitle: '',
        url: { path: '/DevOps/GlobalScripts', query: { script: script.label } },
      })),
    ];
  },
  routes: require('./routes'),
};
module.exports = plugin;
