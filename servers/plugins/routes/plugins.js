const { express } = require('@runeya/common-express');
const multer = require('multer');
const { extractConfigFromTar } = require('../helpers/tarExtractor');
const HTTPError = require('@runeya/common-express-http-error');
const router = express.Router();

router.post('/upload', multer().single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      error: 'NO_FILE_PROVIDED',
      message: 'No file was uploaded'
    });
  }

  const configData = await extractConfigFromTar(req.file.buffer, req.file.originalname);
  res.json({
    message: 'Plugin uploaded and config extracted successfully',
    config: configData
  });

});

module.exports = router;
