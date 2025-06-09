import { defineCustomElement } from 'vue'
import PrimeVue from 'primevue/config';
import Toolbox from './src/Toolbox.ce.vue'
import packageJson from '../package.json';
import args from './src/helpers/args'

const MyToolbox = defineCustomElement(Toolbox, {
  configureApp: (app) => {
    app
      .use(PrimeVue, args.params.primevueConfig)
  }
})

const MySidebar = defineCustomElement(Toolbox, {
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
        location: 'toolbox',
        component: MyToolbox,
        icon: 'fas fa-brain',
        text: 'OpenAI',
      },
    ]
  }
}

globalThis[packageJson.name](callback)
