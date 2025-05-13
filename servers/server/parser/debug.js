const jsonParser = require('./json');
/** @type {import("../models/Service").Parser} */
const parser = {
  id: 'runeya-parser-debug',
  label: 'Runeya debug',
  readonly: true,
  transform: (line, ...rest) => {
    if (!line.json) line = jsonParser.transform(line, ...rest);
    if (!line.json) return line;
    if (/** @type {Array<any>} */(line?.json)?.[0] === 'runeya') {
      line.debug = line.json.length === 2 ? /** @type {Array<any>} */(line?.json)?.[1] : line.json.slice(1);
    }
    return line;
  },
};
module.exports = parser;
