const { express } = require('@runeya/common-express');

const router = express.Router();
const PromiseB = require('bluebird');
const { findService } = require('../models/stack');
const Stack = require('../models/stack');
const plugins = require('../helpers/plugins');
const { readFile } = require('fs/promises');
const path = require('path');
const args = require('../helpers/args');

router.get('/', async (req, res) => {
  res.send(await plugins.getInstalledPlugins());
});

router.get('/front/:name', async (req, res) => {
  const plugin = await plugins.getInstalledPlugin(req.params.name);
  res.send(plugin);
});

router.post('/install', async (req, res) => {
  const { url } = req.body;
  const plugin = await plugins.install(url, req.query.force?.toString() === 'true');
  res.send(plugin);
});

router.delete('/delete', async (req, res) => {
  const { name } = req.body;
  const result = await plugins.uninstall(name);
  res.send(result);
});

router.get('/services/:service', async (req, res) => {
  const service = findService(req.params.service);
  const services = await PromiseB.filter(plugins.forService, async (plugin) => (plugin.hidden ? !(await plugin.hidden(service, Stack, 'service')) : true));
  services.sort((a, b) => (b?.order || Number.MAX_SAFE_INTEGER) - (a?.order || Number.MAX_SAFE_INTEGER));
  res.send(services);
});
router.get('/services', async (req, res) => {
  const services = await PromiseB.filter(plugins.forService, async (plugin) => (plugin.hidden ? !(await plugin.hidden(null, Stack, 'global')) : true));
  res.send(services);
});
router.get('/:type', async (req, res) => {
  /** @type {import("@runeya/modules-plugins-loader-front/src/views").PluginSM<null>[]} */
  // @ts-ignore
  const services = await PromiseB.filter(plugins[req.params.type] || [], async (plugin) => (
    plugin.hidden ? !(await plugin.hidden(null, Stack, req.params.type)) : true)
  );
  services.sort((a, b) => (a.order || 1000) - (b.order || 1000));
  res.send(services);
});

router.get('/:plugin/js', async (req, res) => {
  const file = await plugins.frontFile(req.params.plugin);
  res.setHeader('Content-Type', 'application/javascript');
  res.send(file);
});
router.post('/:plugin/call/:method', async (req, res) => {
  const result = await plugins.call(req.params.plugin, req.params.method, req.body?.args || []);
  if(typeof result === 'function') {
    await result(req, res);
  } else {
    res.json(result);
  }
});




module.exports = router;
