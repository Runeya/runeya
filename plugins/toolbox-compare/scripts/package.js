const buildAndPackage = require('@runeya/common-plugin-packager');

buildAndPackage().catch(err => {
  console.error('❌ Packaging failed:', err);
  process.exit(1);
});
