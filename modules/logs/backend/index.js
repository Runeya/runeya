const dayjs = require('dayjs');

/** @type {import('@runeya/modules-plugins-loader-front/src/views').PluginSM<null>} */
const plugin = {
  enabled: true,
  name: 'Logs',
  displayName: 'Logs',
  description: 'Show, parse and communicate with logs produced by yours commands',
  icon: 'fas fa-terminal',
  export: null,
  placements: ['service'],
  order: 1,
  /**
   * @param {*} search
   * @param {import('@runeya/common-typings').Runeya} runeya
   */
  finder: (search, runeya) => {
    const services = runeya.getServices()
      ?.flatMap((s) => (s.store?.slice(-300).reverse().map((line) => ({ log: line, service: s }))))
      ?.filter(({ log }) => runeya.helpers.searchString(log.raw, search));
    return [
      ...services.map((service) => ({
        icon: 'fas fa-terminal',
        title: service.log.raw,
        group: 'Logs',
        description: `Log from ${service.service.label}`,
        secondaryTitle: service.service.label,
        secondaryDescription: dayjs(service.log.timestamp).format('YYYY-DD-MM HH:mm:ss'),
        url: { path: `/stack-single/${encodeURIComponent(service.service.label)}`, query: { tab: 'Logs' } },
      })),
    ];
  },
  routes: require('./routes'),
};
module.exports = plugin;
