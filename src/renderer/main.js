import { createApp } from "vue";
import App from "./App.vue";
import router from './router';

import VueLazyload from "vue3-lazy";
import { store } from "../store/index.js"; // Import your Vuex store
import "bootstrap/dist/css/bootstrap.min.css";
import '@fortawesome/fontawesome-free/js/all.js';
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./custom.scss";
import "@fortawesome/fontawesome-free/css/all.css";

import { initializeSummonerDataFetching } from "../services/summonerDataService";
import { retrieveFromLocalStorage } from "../store/plugins/storage.mjs";

import Debug from "debug";

if (import.meta.env.MODE !== "production") {
  Debug.enable(import.meta.env.VITE_DEBUG);
}
const vueApp = createApp(App);
async function initializeApp() {
  await store.dispatch('utilities/initializeApp');
}

initializeApp().then(() => {
  const vueApp = createApp(App);
  vueApp.use(VueLazyload, {
    // options...
  });

  vueApp.use(router);
  vueApp.use(store); // Use the Vuex store

  vueApp.mount('#app');
});

// Check for token in local storage and re-authenticate if present
const tokenJson = retrieveFromLocalStorage('token');
if (tokenJson) {
  store.dispatch('auth/reauthenticate', tokenJson);
}

initializeSummonerDataFetching();
