// store/modules/auth.js
import Debug from "debug";
import axios from "axios";
import { getAuthConfig } from "./utilities.js";

const debug = Debug("app:store:init");
const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

const defaultState = () => ({
  currentGameVersion: null,
  dataInitialized: false,
});

export const init = {
  namespaced: true,
  state: defaultState(),
  getters: {
    currentGameVersion: (state) => state.currentGameVersion,
  },
  mutations: {
    RESET_STATE(state) {
      Object.assign(state, defaultState());
    },
    SET_GAME_VERSION(state, version) {
      debug("Setting game version:", version);
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
        if (!state.currentGameVersion) {
          const response = await axios.get(`${baseUrl}/api/utilities/version`);
          const currentVersion = response.data.version;

          commit("SET_GAME_VERSION", currentVersion);
          debug("Current game version:", currentVersion);
          // Additional logic if the version has changed
          if (state.currentGameVersion !== currentVersion) {
            console.log("Game version has changed");
            // Dispatch other actions if needed based on version change
            // For example, dispatch('updateGameData') to fetch updated game data
          }
        } else {
          debug("Game version already set:", state.currentGameVersion);
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
          debug("Current game version:", currentVersion);
          if (state.currentGameVersion !== currentVersion) {
            console.log("Game version has changed");
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
