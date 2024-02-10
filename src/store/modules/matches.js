import axios from "axios";
const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";
import { getAuthConfig } from "./utilities.js";

export const matches = {
  namespaced: true,
  state: () => ({
    matchHistory: null,
  }),
  getters: {
    getMatchHistory: (state) => state.matchHistory,
  },
  mutations: {
    SET_MATCH_HISTORY(state, match) {
      state.matchHistory = match;
    },
  },
  actions: {
    async fetchLastMatch({ commit, state, dispatch }, currentSummonerData) {
      const puuid = currentSummonerData.puuid;
      const count = 2; // Number of matches to fetch

      if (!puuid) {
        console.error("PUUID is missing");
        return;
      }

      const config = getAuthConfig();

      const options = {
        module: "matches",
        type: "matchHistory",
        apiEndpoint: `/api/matches/last-match/${puuid}?count=${count}`,
        vuexMutation: "matches/SET_MATCH_HISTORY",
        itemId: puuid,
        commit,
        state,
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
