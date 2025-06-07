#!/usr/bin/env node

const {build, publish} = require('../src/index.js');

const args = process.argv.slice(2);

(async () => {
  if(args.includes('--build')) {
    await build();
  } 
  if(args.includes('--publish')) {
    await publish();
  }
})();