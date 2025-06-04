/** @param {import('@runeya/common-typings').Runeya} runeya */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ToolboxRegex = (runeya) => {
  return {
    process: (params = {}) => {
      // TODO: Implement your plugin logic here
      return {
        message: 'Hello from toolbox-regex plugin!',
        params
      };
    },
  }
};

module.exports = ToolboxRegex;
