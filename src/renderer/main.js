import { createApp } from 'vue';
import App from './App.vue';
import { store } from '../store/index.js'; // Import your Vuex store
import 'bootstrap/dist/css/bootstrap.min.css';
import './custom.scss'
import './index.scss'


const vueApp = createApp(App);
vueApp.use(store);
vueApp.mount('#app');
