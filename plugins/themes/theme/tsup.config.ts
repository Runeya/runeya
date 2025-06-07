import { getDefaultConfigPlugin } from '@runeya/common-tsup-config';

export default getDefaultConfigPlugin({
  entries: ['./index.js'],
  rootPath: __dirname,
  plugins: [],
  copy: [],
});
