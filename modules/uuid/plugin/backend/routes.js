const express = require('express');

const router = express.Router();
const UUID = require('./UUID');

/** @param {import('@runeya/common-typings').Runeya} runeya */
module.exports = (runeya) => {
  const uuid = UUID(runeya);
  router.get('/uuid/', async (req, res) => {
    const { count, noDash, uppercase } = req.query;
    res.json(uuid.generate({
      count: count ? parseInt(count, 10) : undefined,
      noDash: noDash === 'true',
      uppercase: uppercase === 'true'
    }));
  });
  return router;
};
