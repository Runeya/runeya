const express = require('express');

const router = express.Router();
const Npm = require('./Npm');

/** @param {import('@runeya/common-typings').Runeya} runeya */
module.exports = (runeya) => {
  const { findService } = runeya;

  router.get('/npm/:service', async (req, res) => {
    const service = findService(req.params.service);
    const npm = new Npm(service);
    const isNpm = await npm.isNpm(req.query.cwd);
    res.json(isNpm);
  });
  router.get('/npm/:service/paths', async (req, res) => {
    const service = findService(req.params.service);
    const npm = new Npm(service);
    const paths = await npm.getNpmPaths();
    res.json(paths);
  });

  router.get('/npm/:service/packagejson', async (req, res) => {
    const service = findService(req.params.service);
    const npm = new Npm(service);
    const packagejson = await npm.packageJSON(req.query.cwd);
    res.json(packagejson);
  });

  router.get('/npm/:service/outdated', async (req, res) => {
    const service = findService(req.params.service);
    const npm = new Npm(service);
    const packagejson = await npm.outdated(req.query.cwd);
    res.json(packagejson);
  });

  return router;
};
