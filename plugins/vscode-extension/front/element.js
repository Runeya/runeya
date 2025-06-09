import { defineCustomElement } from 'vue'
import PrimeVue from 'primevue/config';
import View from './src/View.ce.vue'
import packageJson from '../package.json';
import args from './src/helpers/args'

const MyView = defineCustomElement(View, {
  configureApp: (app) => {
    app
    .use(PrimeVue, args.params.primevueConfig)
  }
})

/** @type {import('@runeya/common-typings').PluginCallback} */
const callback = (params) => {
  args.params = params
  return {
    placements: [
      {
        location: 'sidebar',
        component: MyView,
        img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Visual_Studio_Code_1.35_icon.svg/512px-Visual_Studio_Code_1.35_icon.svg.png',
        text: 'Vscode Extension',
      }
    ]
  }
}

globalThis[packageJson.name](callback)
