// store/modules/summoner.js
import axios from "axios";
const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";
// If summoner.js is at src/store/modules/summoner.js and storage.js is at src/store/storage.js
import {
  saveToLocalStorage,
  retrieveFromLocalStorage,
} from "../plugins/storage.mjs";
import Debug from "debug";
const debug = Debug("app:store:summoner");

export const summoner = {
  namespaced: true,
  state: () => ({
    playerDetails: retrieveFromLocalStorage("playerDetails") || [],
    currentSummonerName:
      retrieveFromLocalStorage("currentSummonerName") || "null",
  }),
  getters: {
    currentSummoner: (state) => {
      return (
        state.playerDetails.find(
          (detail) => detail.summonerData.name === state.currentSummonerName
        ) || {}
      );
    },
    // Get all player details
    getAllPlayerDetails: (state) => {
      return state.playerDetails;
    },
    getPlayerDetails: (state) => (gameName) => {
      return (
        state.playerDetails.find(
          (detail) => detail.summonerData.name === gameName
        ) || {}
      );
    },
    currentSummonerName: (state) => {
      return state.currentSummonerName;
    },
    accountData: (state) => {
      return state.playerDetails?.accountData || {};
    },
    currentSummonerData: (state) => {
      const currentSummoner = state.playerDetails.find(
        (detail) => detail.summonerData.name === state.currentSummonerName
      );
      return currentSummoner ? currentSummoner.summonerData : null;
    },
    riotIdParts: (state, getters) => {
      const account = getters.currentSummoner?.accountData;
      return {
        gameName: account?.gameName || "",
        tagLine: account?.tagLine || "",
      };
    },
    summonerName: (getters) => {
      return getters.playerDetails?.summonerData.name || {};
    },
    allSummonerNames: (state) => {
      return state.playerDetails.map((detail) => detail.summonerData.name);
    },
    profileIconId: (state, getters) => {
      return getters.currentSummoner?.summonerData?.profileIconId || null;
    },
    level: (state, getters) => {
      return (
        getters.currentSummoner?.summonerData?.summonerLevel || "Loading..."
      );
    },
    // ... other getters
  },
  mutations: {
    setPlayerDetails(state, data) {
      // Check if the summoner is already in the array
      const existingIndex = state.playerDetails.findIndex(
        (detail) => detail.summonerData.name === data.summonerData.name
      );
      if (existingIndex !== -1) {
        // Update existing summoner data
        state.playerDetails[existingIndex] = data;
      } else {
        // Add new summoner data
        state.playerDetails.push(data);
      }
      saveToLocalStorage("playerDetails", state.playerDetails);
    },
    setCurrentSummonerName(state, summonerName) {
      state.currentSummonerName = summonerName;
      saveToLocalStorage("currentSummonerName", summonerName);
    },
    addOrUpdateSummoner(state, summonerData) {
      const index = state.summoners.findIndex(
        (summoner) =>
          summoner.summonerData.name === summonerData.summonerData.name
      );
      if (index !== -1) {
        state.summoners[index] = summonerData;
      } else {
        state.summoners.push(summonerData);
      }
      saveToLocalStorage("summoners", state.summoners);
    },
  },
  actions: {
    async setCurrentSummoner({ commit }, summonerName) {
      commit("setCurrentSummonerName", summonerName);
      saveToLocalStorage("currentSummonerName", summonerName);
    },
    async fetchSummonerData({ commit, state }, { region, gameName, tagLine }) {
      console.log("fetchSummonerData", gameName);
      const existingDetail = state.playerDetails.find(
        (detail) => detail.summonerData.name === gameName
      );

      if (existingDetail) {
        debug("Summoner data loaded from cache:", existingDetail);
        commit("setCurrentSummonerName", gameName);
        // Optionally, you could re-fetch to update the data
      } else {
        try {
          debug("Fetching summoner data");
          const response = await axios.get(`${baseUrl}/summoner/by-riot-id`, {
            params: { region, gameName, tagLine },
          });
          if (response.status !== 200) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          commit("setPlayerDetails", response.data);
          commit("setCurrentSummonerName", gameName);
        } catch (error) {
          console.error("Error fetching PlayerDetails:", error);
        }
      }
    },

    async getSummonerData({ getters }, gameName) {
      return getters.getPlayerDetails(gameName);
    },
  },
};
