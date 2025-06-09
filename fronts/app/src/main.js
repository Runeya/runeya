import PrimeVueConfig from 'primevue/config';
import Socket from './helpers/Socket';
import Tooltip from 'primevue/tooltip';

import './assets/css/tailwind.output.css';
import './assets/theme/index.scss';
import PrimeVueAura from '@primevue/themes/aura';

import * as Vue from 'vue'
import PluginManager from './models/pluginManager.js';
import { i18n } from './i18n';
import config from './config';

window.Vue = Vue;
window.PrimeVueConfig = PrimeVueConfig;
window.PrimeVueAura = PrimeVueAura; 



(async () => {
  console.log('Init Socket...');
  await Socket.init('/socket');

  const { default: router } = await import('./router/router');
  const { createApp } = await import('vue');
  const { default: App } = await import('./App.vue');
  const { default: system } = await import('./models/system');
  const { default: views } = await import('@runeya/modules-plugins-loader-front/src/views');
  const { default: Editor } = await import('./components/Editor.vue');
  const { default: Section } = await import('./components/Section.vue');
  const { default: Markdown } = await import('./components/Markdown.vue');

  await PluginManager.init();

  await config.init();

  system.getVersion().catch((err) => {
    console.error(err);
  });

  const app = createApp(App)
    .use(i18n)
    .component('Editor', Editor)
    .component('SectionCmp', Section)
    .use(Markdown)
    .use(PrimeVueConfig, {
      theme: {
        preset: PrimeVueAura,
        options: {
          darkModeSelector: '.theme-dark-bak',
        },
      },
    })
    .use(router)
    .directive('tooltip', Tooltip);
  views.forEach((cmp) => app.component(cmp.name, cmp.cmp));
  app.mount('#app');
})();
