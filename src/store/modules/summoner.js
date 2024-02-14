// store/modules/summoner.js
import axios from "axios";
const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";
// If summoner.js is at src/store/modules/summoner.js and storage.js is at src/store/storage.js
import { getAuthConfig } from "./utilities.js";

import Debug from "debug";
const debug = Debug("app:store:summoner");

export const summoner = {
  namespaced: true,
  state: () => ({
    playerDetails: [],
    currentSummoner: null,
  }),
  getters: {
    getSummonerDataByName: (state) => (summonerName) => {
      return (
        state.playerDetails.find((detail) => detail.name === summonerName) ||
        null
      );
    },
    getAllPlayerDetails: (state) => {
      return state.playerDetails;
    },
    getCurrentSummoner: (state) => {
      return state.currentSummoner;
    },
  },
  mutations: {
    setPlayerDetails(state, data) {
      state.playerDetails = data;
    },
    setCurrentSummoner(state, summoner) { 
      state.currentSummoner = summoner;
    },
  },
  actions: {
    async updateSummonerDetailsIfNeeded(
      { dispatch, state },
      { gameName, newSummonerLevel, newProfileIconId }
    ) {
      const existingDetail = state.playerDetails.find(
        (detail) => detail.summonerData.name === gameName
      );

      if (
        existingDetail &&
        (existingDetail.summonerData.summonerLevel !== newSummonerLevel ||
          existingDetail.summonerData.profileIconId !== newProfileIconId)
      ) {
        // Detected change in summoner level or icon ID, initiate an update
        debug("Summoner details changed, updating...");
        await dispatch("updateSummonerDetails", {
          puuid: existingDetail.accountData.puuid,
          summonerLevel: newSummonerLevel,
          profileIconId: newProfileIconId,
        });
      }
    },

    async fetchSummonerData({ commit, state }, { region, gameName, tagLine }) {
      console.log("fetchSummonerData", gameName);
      const existingDetail = state.playerDetails.find(
        (detail) => detail.gameName === gameName
      );

      if (existingDetail) {
        debug("Summoner data loaded from cache:", existingDetail);
        // Optionally, you could re-fetch to update the data
      } else {
        try {
          const authConfig = getAuthConfig();

          debug("Fetching summoner data");
          const response = await axios.get(`${baseUrl}/summoner/by-riot-id`, {
            ...authConfig,
            params: { region, gameName, tagLine },
          });
          if (response.status !== 200) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          commit("setPlayerDetails", response.data);
        } catch (error) {
          console.error("Error fetching PlayerDetails:", error);
        }
      }
    },

    async fetchSummonerDataByAccountId({ commit }) {
      try {
        const authConfig = getAuthConfig();

        const response = await axios.get(`${baseUrl}/summoner/data`, {
          ...authConfig,
        });
        commit("setPlayerDetails", response.data);
        if (response.data.length > 0) {
          commit("setCurrentSummoner", response.data[0]); // Set the first summoner as the current selection
        }
      } catch (error) {
        console.error("Error fetching summoner data:", error);
      }
    },
  },
};
