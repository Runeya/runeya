const path = require('path');

module.exports = {
  ...require('@runeya/common-jest/src/jest.config.default'),
  rootDir: path.resolve(__dirname),
};
