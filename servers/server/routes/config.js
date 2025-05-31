const { express } = require('@runeya/common-express');

const router = express.Router();

router.get('/', async (req, res) => {
  res.send({
    pluginsUrl: process.env.APP_LANDING_URL
      ? process.env.APP_LANDING_URL + '/plugins'
      : 'https://runeya.dev/plugins'
  });
});
module.exports = router;
