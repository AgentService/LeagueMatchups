import { createApp } from "vue";
import App from "./App.vue";
import VueLazyload from "vue3-lazy";
import { store } from "../store/index.js"; // Import your Vuex store
import "bootstrap/dist/css/bootstrap.min.css";
import '@fortawesome/fontawesome-free/js/all.js';
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./custom.scss";
import "@fortawesome/fontawesome-free/css/all.css";

import { initializeSummonerDataFetching } from "../services/summonerDataService";
import Debug from "debug";

if (import.meta.env.MODE !== "production") {
	Debug.enable(import.meta.env.VITE_DEBUG);
}

const vueApp = createApp(App);

vueApp.use(VueLazyload, {
	// options...
});
  
vueApp.use(store);
vueApp.mount("#app");
initializeSummonerDataFetching();
