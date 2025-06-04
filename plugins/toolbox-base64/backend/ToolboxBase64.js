/** @type {import('@runeya/common-typings').Plugin} */
const Base64 = async () => ({
  /**
   * Encode une chaîne en Base64
   * @param {string} value - La chaîne à encoder
   * @returns {string} - La chaîne encodée
   */
  encode: (value = '') => {
    try {
      const buffer = Buffer.from(value, 'utf-8');
      return buffer.toString('base64');
    } catch (error) {
      console.error('Error encoding to base64:', error);
      return '';
    }
  },

  /**
   * Décode une chaîne Base64
   * @param {string} value - La chaîne Base64 à décoder
   * @returns {string} - La chaîne décodée
   */
  decode: (value = '') => {
    try {
      const buffer = Buffer.from(value, 'base64');
      return buffer.toString('utf-8');
    } catch (error) {
      console.error('Error decoding from base64:', error);
      return '';
    }
  },
});

module.exports = Base64; 