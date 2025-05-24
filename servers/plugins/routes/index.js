const { express } = require('@runeya/common-express');

const router = express.Router();

router.use('/organisations', require('./organizations'));
router.use('/plugins', require('./plugins'));

module.exports = router;
