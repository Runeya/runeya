const { v4 } = require('uuid');

/** @param {import('@runeya/common-typings').Runeya} runeya */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const UUID = (runeya) => ({
  generate: ({ count = 1, noDash = false, uppercase = false } = {}) => {
    const uuids = Array(count).fill().map(() => {
      let uuid = v4();
      if (noDash) {
        uuid = uuid.replace(/-/g, '');
      }
      if (uppercase) {
        uuid = uuid.toUpperCase();
      }
      return uuid;
    });
    return count === 1 ? uuids[0] : uuids;
  },
});

module.exports = UUID;
