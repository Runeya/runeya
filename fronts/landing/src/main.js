// .env file should be created with the following variables:
// VUE_APP_API_URL=/api/auth
// VUE_APP_AUTH_REDIRECT_URL=http://localhost:8080/auth/callback
// VUE_APP_DASHBOARD_URL=/app
// VUE_APP_DOCS_URL=https://docs.runeya.io

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './assets/css/tailwind.output.css';
import { i18n } from './i18n';

// Font Awesome
import '@fortawesome/fontawesome-free/css/all.min.css';

// PrimeVue
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import ToastService from 'primevue/toastservice';
import ConfirmationService from 'primevue/confirmationservice';

const app = createApp(App);
app.use(i18n);
app.use(router);
app.use(PrimeVue, { ripple: true, theme: { preset: Aura } });
app.use(ToastService);
app.use(ConfirmationService);
app.mount('#app'); 