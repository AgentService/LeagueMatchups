import { createApp } from 'vue';
import App from './App.vue';
import { store } from '../store/vuexStore.js'; // Import your Vuex store
import 'bootstrap/dist/css/bootstrap.min.css';
//import '@fortawesome/fontawesome-free/js/all.js';
import '@fortawesome/fontawesome-free/css/all.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import './custom.scss'





const vueApp = createApp(App);
vueApp.use(store);
vueApp.mount('#app');
