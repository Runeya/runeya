import { getDefaultConfigPlugin } from '@runeya/common-tsup-config';
import { defineConfig } from 'tsup';

console.log('tsup.config.ts');

export default defineConfig({
  entry: ['./index.js'],
  // ...
});