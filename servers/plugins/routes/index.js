const { express } = require('@runeya/common-express');

const router = express.Router();

router.use('/organisations', require('./organizations'));

module.exports = router;
