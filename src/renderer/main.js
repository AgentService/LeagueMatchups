import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

import VueLazyload from "vue3-lazy";
import { store } from "../store/index.js"; // Import your Vuex store
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/js/all.js";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./custom.scss";
import "@fortawesome/fontawesome-free/css/all.css";
import { setupBaseUrl } from './globalSetup';

import { initializeSummonerDataFetching, startSummonerNameCheck } from "../services/summonerDataService";
import { retrieveFromLocalStorage } from "../store/plugins/storage.mjs";

import Debug from "debug";

if (import.meta.env.MODE !== "production") {
  Debug.enable(import.meta.env.VITE_DEBUG);
}
async function initializeApp() {
  await setupBaseUrl(); 
  await store.dispatch("init/initializeApp");
}

initializeApp().then(() => {

  const vueApp = createApp(App);
  vueApp.use(VueLazyload, {
    // options...
  });

  vueApp.use(router);
  vueApp.use(store); // Use the Vuex store

  vueApp.mount("#app");
});

const tokenJsonString = localStorage.getItem("token");
if (tokenJsonString) {
  const tokenObject = JSON.parse(tokenJsonString);
  const token = tokenObject.data;

  if (token) {
    store.dispatch("auth/reauthenticate", token);
  }
}

initializeSummonerDataFetching();
startSummonerNameCheck();