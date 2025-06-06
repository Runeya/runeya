import { defineConfig } from 'tsup'
import { getDefaultConfigServer } from '@runeya/common-tsup-config'

export default defineConfig(getDefaultConfigServer({
  rootPath: __dirname,
  entries: [
    './bin/www',
  ]
})) 