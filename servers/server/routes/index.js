const { express } = require('@runeya/common-express');

const router = express.Router();
const plugins = require('../helpers/plugins');

plugins.registerRoutes(router);
router.use('/plugins', require('./plugins'));
router.use('/system', require('./system'));
router.use('/stack', require('./stack'));
router.use('/fs', require('./fs'));
router.use('/crypto', require('./crypto'));
router.use('/parsers', require('./parsers'));
router.use('/editors', require('./editors'));
router.use('/config', require('./config'));

router.get('/version', async (req, res) => {
  res.send(require('../helpers/version').version);
});

module.exports = router;
