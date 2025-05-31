/** @param {import('@runeya/common-typings').Runeya} runeya */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ToolboxCompare = (runeya) => {
  return {
    process: (params = {}) => {
      // TODO: Implement your plugin logic here
      return {
        message: 'Hello from toolbox-compare plugin!',
        params
      };
    },
  }
};

module.exports = ToolboxCompare;
