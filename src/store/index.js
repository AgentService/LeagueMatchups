// store/index.js
import { createStore } from "vuex";
import { summoner } from "./modules/summoner.js";
import { matchups } from "./modules/matchups.js";
import { matches } from "./modules/matches.js";
import { notes } from "./modules/notes.js";
import { items } from "./modules/items.js";
import { userPreferences } from "./modules/userPreferences.js"; // Adjust the path as necessary
import { wsClient } from "./modules/wsClient.js";

import { champions } from "./modules/champions.js";
import { auth } from "./modules/auth.js";
import { init } from "./modules/init.js";
import { validateApiResponse, handleApiError } from "./modules/utilities.js";

import VuexPersistence from "vuex-persist";
import axios from "axios";
import { metrics } from "./modules/metrics.js";

// VuexPersistence for auth module
const vuexLocalAuth = new VuexPersistence({
  key: "authState", // Unique key for localStorage
  storage: window.localStorage,
  modules: ["auth"], // Specify the module name here
});

const vuexLocal = new VuexPersistence({
  storage: window.localStorage, // or window.sessionStorage
  modules: [
    "champions",
    "matchups",
    "init",
    // "auth",
    "matches",
    "items",
    "notes",
    "summoner",
    "userPreferences",
    "wsClient",
    "metrics",
  ],
  reducer: (state) => ({
    champions: state.champions,
    matchups: state.matchups,
    init: state.init,
    matches: state.matches,
    items: state.items,
    notes: state.notes,
    summoner: state.summoner,
    userPreferences: state.userPreferences,
    wsClient: state.wsClient,
    metrics: state.metrics,
  }),
});

const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

export const store = createStore({
  modules: {
    summoner: summoner,
    champions: champions,
    matchups: matchups,
    auth: auth,
    init: init,
    matches: matches,
    items: items,
    notes: notes,
    userPreferences: userPreferences,
    wsClient: wsClient,
    metrics: metrics,
  },

  actions: {
    /* GENERIC UTILITY FUNCTION
     * Fetches data from an API endpoint and caches it. If the data is already cached
     * and is valid, it uses the cached data instead of fetching from the API.
     *
     * @param {Object} options - The options for fetching and caching data.
     * @param {string} options.type - The type of data being handled (e.g., 'championData').
     * @param {string} options.apiEndpoint - The API endpoint to fetch data from.
     * @param {string} options.vuexMutation - The Vuex mutation type to commit the fetched data.
     * @param {string} [options.itemId] - The id of the item to fetch (e.g., champion id).
     * @param {Function} options.commit - The Vuex `commit` function to update the state.
     * @param {string} [options.storageType='local'] - The type of storage to use ('local' or 'session').
     * @param {boolean} [options.skipCacheValidation=false] - Whether to skip cache validation and always fetch new data.
     * @returns {Promise<Object>} A promise that resolves to the fetched (or cached) data.
     */
    // Modify fetchDataAndCache to only fetch data based on options
    async fetchDataAndCache({ commit, state }, options) {
      const {
        module,
        type,
        apiEndpoint,
        vuexMutation,
        itemId,
        skipCacheValidation = false,
        authConfig = {},
      } = options;

      // Check cache validity based on the specific item
      let cachedItem;

      if (state[module] && state[module][type]) {
        cachedItem = itemId ? state[module][type][itemId] : state[module][type];
      }
      // Use data from Vuex state if available and valid
      if (!skipCacheValidation && cachedItem && !isEmpty(cachedItem)) {
        return cachedItem;
      }

      // Fetch data based on provided options
      try {
        const response = await axios.get(
          `${baseUrl}` + apiEndpoint,
          authConfig
        );
        const data = validateApiResponse(response);
        commit(vuexMutation, data);

        return data;
      } catch (error) {
        return handleApiError(error);
      }
    },

    async postDataAndCache({ commit }, options) {
      const { apiEndpoint, vuexMutation, data, authConfig = {} } = options;

      try {
        // console.log("Full URL:", `${baseUrl}${apiEndpoint}`);

        const response = await axios.post(
          `${baseUrl}` + apiEndpoint,
          data,
          authConfig
        );
        const newData = validateApiResponse(response);
        commit(vuexMutation, newData);
        return newData;
      } catch (error) {
        return handleApiError(error);
      }
    },

    async putDataAndCache({ commit }, options) {
      const { apiEndpoint, vuexMutation, data, authConfig = {} } = options;

      try {
        const response = await axios.put(
          `${baseUrl}` + apiEndpoint,
          data,
          authConfig
        );
        const updatedData = validateApiResponse(response);
        commit(vuexMutation, updatedData);
        return updatedData;
      } catch (error) {
        return handleApiError(error);
      }
    },
    async patchDataAndCache({ commit }, options) {
      const { apiEndpoint, vuexMutation, data, authConfig = {} } = options;

      try {
        const response = await axios.patch(
          `${baseUrl}` + apiEndpoint,
          data,
          authConfig
        );
        const updatedData = validateApiResponse(response);
        commit(vuexMutation, updatedData);
        return updatedData;
      } catch (error) {
        return handleApiError(error);
      }
    },
  },
  plugins: [vuexLocal.plugin, vuexLocalAuth.plugin],
});
function isEmpty(obj) {
  return obj && Object.keys(obj).length === 0 && obj.constructor === Object;
}
export default store; // Make sure this line is present
