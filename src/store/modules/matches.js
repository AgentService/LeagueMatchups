import axios from "axios";
const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";
import { getAuthConfig } from "./utilities.js";

export const matches = {
  namespaced: true,
  state: () => ({
    matchHistory: null,
    lastThirtyGames: [],
  }),
  getters: {
    getMatchHistory: (state) => state.matchHistory,
  },
  mutations: {
    SET_MATCH_HISTORY(state, match) {
      state.matchHistory = match;
    },
    SET_LAST_THIRTY_GAMES(state, games) {
      state.lastThirtyGames = games;
    },
  },
  // In deinem Vuex-Store-Modul (z.B. matches.js)
  actions: {
    async fetchLastMatch({ commit, state, rootGetters, dispatch }) {
      const puuid = rootGetters["summoner/currentSummonerData"]?.puuid || "";
      const count = 8; // Number of matches to fetch

      if (!puuid) {
        console.error("PUUID is missing");
        return;
      }

      const config = getAuthConfig();

      const options = {
        module: "matches", // Assuming 'match' is the Vuex module where this data will be stored
        type: "matchHistory", // A specific type identifier for this data
        apiEndpoint: `/api/matches/last-match/${puuid}?count=${count}`, // API endpoint to fetch data
        vuexMutation: "matches/SET_MATCH_HISTORY", // Mutation type to commit the fetched data
        itemId: puuid, // Unique identifier for caching purposes
        commit, // Passing the Vuex commit function
        state, // Passing the Vuex state
        auth: config,
      };

      try {
        const data = await dispatch("fetchDataAndCache", options, {
          root: true,
        });
        console.log("Fetched Last Match Data:", data);
      } catch (error) {
        console.error("Error fetching the last match:", error);
      }
    },
  },
};

export default matches;
