import { createApp } from 'vue';
import App from './App.vue';
import './assets/css/tailwind.output.css';
import { i18n } from './i18n';

// Font Awesome
import '@fortawesome/fontawesome-free/css/all.min.css';

const app = createApp(App);
app.use(i18n);
app.mount('#app'); 