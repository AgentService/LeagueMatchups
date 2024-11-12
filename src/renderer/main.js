// main.js is the entry point for the renderer process in Electron.
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import ClickOutsideDirective from "./utils/ClickOutsideDirective";

import VueLazyload from "vue3-lazy";
import { store } from "../store"; // Import your Vuex store
import "@fortawesome/fontawesome-free/js/all.js";
import "@fortawesome/fontawesome-free/css/all.css";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import EventHandler from './utils/EventHandler';

import "../axiosSetup";
import { setupBaseUrl } from "./globalSetup";
import "./custom.scss";
import Debug from "debug";
import debug from "debug";

// Set up debugging based on environment variables
if (import.meta.env.MODE !== "production") {
  console.log("Running in development mode");
  Debug.enable(import.meta.env.VITE_DEBUG);
  try {
    require('electron-reloader')(module);
  } catch (_) { }
}

library.add(fas);

async function initializeApp() {
  const webSocket = window.ws;                // WebSocket instance (from preload script)
  const ipcRenderer = window.electron.ipcRenderer;  // IPC instance (from preload script)
  const eventHandler = new EventHandler(webSocket, ipcRenderer); // Initialize EventHandler
  debug("Initialized EventHandler:", eventHandler);
  debug("WebSocket instance:", webSocket);
  debug("IPC Renderer instance:", ipcRenderer);
  // Initialize base URL and app state
  await setupBaseUrl();
  await store.dispatch("init/initializeApp");

  // Create Vue app and register plugins/directives
  const vueApp = createApp(App);
  vueApp.directive("click-outside", ClickOutsideDirective);
  vueApp.use(VueLazyload, { /* Lazyload options here if needed */ });
  vueApp.use(router);
  vueApp.use(store);
  vueApp.component("font-awesome-icon", FontAwesomeIcon);

  // Mount the app
  vueApp.mount("#app");

  // Check for existing tokens and attempt reauthentication if found
  const token = store.state.auth.token;
  const refreshToken = store.state.auth.refreshToken;

  // Always reset the API fetch flag on app start
  store.commit("summoner/setFetchedFromAPI", false);
  // store.dispatch('summoner/deduplicatePlayerDetails');

  if (token && refreshToken) {
    try {
      // Attempt to reauthenticate with stored tokens
      await store.dispatch("auth/reauthenticate", { token, refreshToken });

      // Fetch recent matches after successful reauthentication
      await store.dispatch("matches/fetchLastMatch", { forceRefresh: false, count: 5 });

      // Initialize summoner data fetching and summoner name check only after auth
      // initializeSummonerDataFetching();
      // startSummonerNameCheck();

    } catch (error) {
      console.error("Error during token reauthentication or fetching match:", error);

      // Optional: Handle reauthentication failure by clearing tokens and redirecting to login
      store.commit("auth/SET_USER", null);
      store.commit("auth/SET_TOKEN", null);
      store.commit("auth/SET_REFRESH_TOKEN", null);
      router.replace("/login");
    }
  } else {
    console.log("No valid tokens found; skipping reauthentication.");
  }
}

// Initialize the app and handle any errors in initialization
initializeApp().catch((error) => {
  console.error("Error during app initialization:", error);
});
