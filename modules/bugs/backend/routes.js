const express = require('express');

const router = express.Router();
const pathfs = require('path');
const { fork } = require('child_process');

/** @param {import('@runeya/common-typings').Runeya} runeya */
module.exports = (runeya) => {
  router.get('/bugs/:service', async (req, res) => {
    const service = runeya.findService(req.params.service);
    if (!service) return res.status(404).send('SERVICE_NOT_FOUND');
    const ts = fork(pathfs.resolve(__dirname, 'checkJsFork'));
    ts.on('message', (results) => {
      res.json(results);
      ts.kill('SIGKILL');
    });
    ts.send(req.query.cwd || service.getRootPath() || __dirname);
    return null;
  });
  return router;
};
