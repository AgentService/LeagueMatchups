// store/modules/auth.js
import Debug from "debug";
import axios from "axios";
import { getAuthConfig } from "./utilities.js";

const debug = Debug("app:store:init");
const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

export const init = {
  namespaced: true,
  state: {
    currentGameVersion: null,
    dataInitialized: false,
  },
  getters: {
    currentGameVersion: (state) => state.currentGameVersion,
  },
  mutations: {
    // ... other mutations
    SET_GAME_VERSION(state, version) {
      state.currentGameVersion = version;
    },
    SET_DATA_INITIALIZED(state, value) {
      state.dataInitialized = value;
    },
  },
  actions: {
    async checkAndUpdateVersion({ commit, state }) {
      try {
        // Fetch the current game version from the server
        const response = await axios.get(`${baseUrl}/api/utilities/version`);
        const currentVersion = response.data.version;

        commit("SET_GAME_VERSION", currentVersion);

        // Additional logic if the version has changed
        if (state.currentGameVersion !== currentVersion) {
          // Dispatch other actions if needed based on version change
          // For example, dispatch('updateGameData') to fetch updated game data
        }
      } catch (error) {
        console.error("Error checking and updating game version:", error);
      }
    },
    async initializeApp({ commit, dispatch, state }) {
      debug("Initializing app", state.dataInitialized);
      if (!state.dataInitialized) {
        await dispatch(
          "fetchDataAndCache",
          {
            module: "champions",
            type: "championList",
            apiEndpoint: "/api/champions/list",
            vuexMutation: "champions/SET_CHAMPION_LIST_DATA",
            skipCacheValidation: false,
          },
          { root: true }
        );
        await dispatch(
          "fetchDataAndCache",
          {
            module: "champions",
            type: "championDetails",
            apiEndpoint: "/api/champions/details",
            vuexMutation: "champions/SET_ALL_CHAMPION_DETAILS",
            skipCacheValidation: false,
          },
          { root: true }
        );
        try {
          // Fetch the current game version from the server
          const response = await axios.get(`${baseUrl}/api/utilities/version`);
          const currentVersion = response.data.version;

          commit("SET_GAME_VERSION", currentVersion);

          if (state.currentGameVersion !== currentVersion) {
            // Dispatch other actions if needed based on version change
            // For example, dispatch('updateGameData') to fetch updated game data
          }
        } catch (error) {
          console.error("Error checking and updating game version:", error);
        }
        commit("SET_DATA_INITIALIZED", true);
      }
    },
  },
};
