/** @param {import('@runeya/common-typings').Runeya} runeya */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ThemeCyan = (runeya) => {
  return [
    ...require('./themes/ThemeRed'),
    ...require('./themes/ThemeOrange'),
    ...require('./themes/ThemeYellow'),
    ...require('./themes/ThemeGreen'),
    ...require('./themes/ThemeCyan'),
    ...require('./themes/ThemeBlue'),
    ...require('./themes/ThemeIndigo'),
    ...require('./themes/ThemePurple'),
    ...require('./themes/ThemePink'),
  ]
};

module.exports = ThemeCyan;
