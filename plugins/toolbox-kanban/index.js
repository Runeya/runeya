/** @type {import('@runeya/modules-plugins-loader-front/src/views').PluginSM} */
const plugin = {
  enabled: true,
  name: 'ToolboxKanban',
  displayName: 'Kanban Board',
  description: 'Visual task management with drag & drop kanban boards',
  icon: 'fas fa-columns',
  order: 5,
  placements: [
    {
      position: 'toolbox',
      label: 'Kanban',
      icon: 'fas fa-columns',
      goTo: { path: '/toolbox-kanban' },
      active: 'toolbox-kanban',
    }
  ],
  export: require('./backend'),
};

module.exports = plugin; 