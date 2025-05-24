import { defineCustomElement } from 'vue'
import PrimeVue from 'primevue/config';
import UUID from './UUID.ce.vue'
import { Button, InputNumber } from 'primevue';
import '@fortawesome/fontawesome-free/css/all.min.css'
import Section from '../../../../../fronts/app/src/components/Section.vue';
import '../../../../../fronts/app/src/assets/theme/index.scss';
import Aura from '@primevue/themes/aura';
import Tooltip from 'primevue/tooltip';

const MyUUID = defineCustomElement(UUID, {
  configureApp: (app) => {
    app
    .use(PrimeVue, {
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '.theme-dark',
        },
      },
    })
    .component('SectionCmp', Section)
    .component('Button', Button)
    .component('InputNumber', InputNumber)
    .directive('tooltip', Tooltip);
  }
})

export { MyUUID }

customElements.define('runeya-uuid', MyUUID)
