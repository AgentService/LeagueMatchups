import { createApp } from 'vue';
import { createStore } from 'vuex';
import App from './App.vue';
import { store } from '../store/index.js'; // Import your Vuex store
import './index.css'

const vueApp = createApp(App);

vueApp.use(store);

vueApp.mount('#app');
