import { createApp } from 'vue';
import { createStore } from 'vuex';
import App from './App.vue';
import './style.css';
import { store } from '../store/index.js'; // Import your Vuex store



const app = createApp(App);
app.use(store);

app.mount('#app');
