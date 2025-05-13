const express = require('express');

const router = express.Router();
const PromiseB = require('bluebird');

/**
 *
 * @param {import('@runeya/modules-plugins-loader-front/src/views').PluginSM<any>} plugin
 */
function pluginToUrl(plugin) {
  for (let i = 0; i < plugin.placements.length; i += 1) {
    const placement = plugin.placements[i];
    if (typeof placement !== 'string') {
      if (placement.position === 'toolbox') {
        // @ts-ignore
        return `/toolbox${placement.goTo?.path || placement.goTo}`;
      }
      if (placement.position === 'sidebar') {
        // @ts-ignore
        return `${placement.goTo?.path || placement.goTo}`;
      }
    }
  }
  return '';
}

/** @param {import('@runeya/common-typings').Runeya} runeya */
const routes = (runeya) => {
  const {
    getServices,
    helpers: { searchString },
  } = runeya;
  router.get('/finder/search', async (req, res) => {
    const search = req.query.q?.toString()?.toUpperCase() || '';
    /** @type {FinderChoice[]} */
    const services = getServices()
      .filter((service) => searchString(service?.label, search))
      .map((service) => ({
        title: service.label,
        description: service.description,
        group: 'Service',
        url: `/stack-single/${service.label}`,
      }));

    const { plugins } = runeya;
    const _plugins = (await PromiseB
      .map(Object.keys(plugins), (/** @type {keyof typeof plugins} */key) => plugins[key])
      .map(async (plugin) => [
        ...(await plugin?.finder?.(search, runeya)?.catch?.(() => ([])) || []),
        ...(searchString(plugin.name, search) ? [{
          title: plugin.displayName || plugin.name,
          description: plugin.description,
          group: 'Plugin',
          icon: plugin.icon,
          url: pluginToUrl(plugin) || '',
        }] : []),
      ]))
      .flat()
      .filter((a) => a?.url);

    /** @type {FinderChoice[]} */
    const result = [
      ...services,
      ..._plugins,
    ].filter((a) => a);
    res.send(result);
  });
  return router;
};

module.exports = routes;

/**
 * @typedef {{
 *  icon?: string,
 *  title: string,
 *  group?: string,
 *  description?: string,
 *  secondaryTitle?: string
 *  secondaryDescription?: string,
 *  url: import('vue-router').RouteLocationRaw | string,
 * }} FinderChoice
 */
