// main.js
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import ClickOutsideDirective from "./utils/ClickOutsideDirective";

import VueLazyload from "vue3-lazy";
import { store } from "../store"; // Import your Vuex store
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/js/all.js";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./custom.scss";
import "@fortawesome/fontawesome-free/css/all.css";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

import "../axiosSetup";

library.add(fas);

import { setupBaseUrl } from "./globalSetup";

import {
  initializeSummonerDataFetching,
  startSummonerNameCheck,
} from "../services/summonerDataService";

import Debug from "debug";

if (import.meta.env.MODE !== "production") {
  console.log("MODE: ", import.meta.env.MODE);
  console.log("Running in development mode");
  console.log("DEBUG?: ", import.meta.env.VITE_DEBUG);
  Debug.enable(import.meta.env.VITE_DEBUG);
}
console.log("DEBUG?: ", import.meta.env.VITE_DEBUG);
Debug.enable(import.meta.env.VITE_DEBUG);

async function initializeApp() {
  await setupBaseUrl();
  await store.dispatch("init/initializeApp");
}

initializeApp()
  .then(() => {
    const vueApp = createApp(App);
    vueApp.directive("click-outside", ClickOutsideDirective);

    vueApp.use(VueLazyload, {
      // options...
    });
    initializeSummonerDataFetching();
    startSummonerNameCheck();
    vueApp.use(router);
    vueApp.use(store);

    vueApp.component("font-awesome-icon", FontAwesomeIcon);
    vueApp.mount("#app");

    const token = store.state.auth.token;
    const refreshToken = store.state.auth.refreshToken;
    if (token && refreshToken) {
      // Dispatch an action that handles reauthentication and potentially refreshes the token
      store.dispatch("auth/reauthenticate", { token, refreshToken });
    }
  })
  .catch((error) => {
    console.error("Error during app initialization:", error);
  });
