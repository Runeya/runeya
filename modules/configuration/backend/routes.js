const express = require('express');

const router = express.Router();
const pathfs = require('path');
const { fork } = require('child_process');
const EnvironmentPersitence = require('@runeya/servers-server/models/Environment');

/** @param {import('@runeya/common-typings').Runeya} runeya */
module.exports = (runeya) => {
  router.get('/configuration/services/:service/envs', async (req, res) => {
    const service = runeya.findService(req.params.service);
    if (!service) return res.status(404).send('SERVICE_NOT_FOUND');

    res.json(EnvironmentPersitence.all());
  });
  return router;
};

/**
 * @typedef {{
 * [key:string]: {
 *    label: string
 *    color?: string
 *    bgColor?: string
 *    env: {
 *      [key:string]: string | {value: string, override: string}
 *    }
 * }
 * }} Environment
 */
