// store/modules/matchups.js
import Debug from "debug";
import { getAuthConfig } from "./utilities.js";
import axios from "axios";
const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

const debug = Debug("app:store:matchups");

export const matchups = {
  namespaced: true,
  state: {
    championA: null,
    championB: null,
    matchupList: [],
    currentMatchup: null, // Holds the currently selected matchup
  },
  getters: {
    getChampionA: (state) => state.championA,
    getChampionB: (state) => state.championB,
    getCurrentMatchup: (state) => state.currentMatchup,
  },
  mutations: {
    SET_CHAMPION_A(state, champion) {
      state.championA = champion;
    },
    SET_CHAMPION_B(state, champion) {
      state.championB = champion;
    },
    CLEAR_MATCHUPS(state) {
      state.matchupList = [];
    },
    SET_CURRENT_MATCHUP(state, matchup) {
      state.currentMatchup = matchup;
    },

    ADD_OR_UPDATE_MATCHUP(state, oMatchup) {
      const index = state.matchupList.findIndex((m) => m.id === oMatchup.id);

      if (index !== -1) {
        state.matchupList[index] = oMatchup;
      } else {
        state.matchupList.push(oMatchup);
      }
    },
  },
  actions: {
    async handleMatchupCreation({ commit, rootState }, { id, key }) {
      // Check if the matchup is already in vuex state
      if (
        rootState.matchups.matchupList &&
        rootState.matchups.matchupList.length > 0
      ) {
        const existingMatchup = rootState.matchups.matchupList.find(
          (matchup) => matchup.id === id
        );
        if (existingMatchup) {
          commit("SET_CURRENT_MATCHUP", existingMatchup);
          return existingMatchup;
        }
      }
      const config = getAuthConfig();
      // Assuming `id` is a concatenation of champion IDs, and `key` is the champion name pair
      // Fetch the matchup data using the champion IDs
      try {
        const response = await axios.get(
          `${baseUrl}/api/matchups/${id}`,
          config
        );
        // Assuming the backend responds with the matchup data directly
        if (response.data) {
          commit("SET_CURRENT_MATCHUP", response.data);
          return response.data;
        }
      } catch (error) {
        console.error("Failed to fetch matchup:", error);
        // Handle error appropriately
      }
    },
    setChampionA({ commit }, payload) {
      commit("SET_CHAMPION_A", payload);
    },
    setChampionB({ commit }, payload) {
      commit("SET_CHAMPION_B", payload);
    },
  },
};
export default matchups; // Make sure this line is present
