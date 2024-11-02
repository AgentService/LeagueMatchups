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
    playerDetails: [], // Stores summoner-related information
    currentSummoner: null, // Stores the current summoner
    fetchedFromAPI: false, // Tracks if the API call has been made
  }),
  getters: {
    getSummonerDataByName: (state) => (gameName) => {
      return state.playerDetails.find(detail => detail.gameName === gameName) || null;
    },
    getCurrentSummoner: (state) => state.currentSummoner,
    getAllPlayerDetails: (state) => {
      return state.playerDetails; // This will return the list of all known summoners
    },
  },
  mutations: {
    setFetchedFromAPI(state, status) {
      state.fetchedFromAPI = status;
    },
    setPlayerDetails(state, { summonerNameValue, tagLine, webSocketResponse = null, apiResponse = null }) {
      // Check if there's an existing summoner with the same gameName and tagLine
      const existingIndex = state.playerDetails.findIndex(
        (detail) => detail.gameName === summonerNameValue && detail.tagLine === tagLine
      );

      // Set default values for `gameName` and `webSocketResponse`
      const newEntry = {
        gameName: summonerNameValue || apiResponse?.gameName || "", // Fallback to apiResponse gameName if needed
        tagLine: tagLine,
        webSocketResponse: webSocketResponse || {}, // Ensure a default empty object
        apiResponse: apiResponse || {},
      };

      if (existingIndex !== -1) {
        // Update existing entry if found
        const existingSummoner = state.playerDetails[existingIndex];
        state.playerDetails[existingIndex] = {
          ...existingSummoner,
          webSocketResponse: webSocketResponse || existingSummoner.webSocketResponse,
          apiResponse: apiResponse || existingSummoner.apiResponse,
        };
      } else {
        // Add the new entry if it’s unique
        state.playerDetails.push(newEntry);
      }

      // Auto-select as the current summoner if no current summoner is selected
      if (!state.currentSummoner) {
        state.currentSummoner = state.playerDetails[0];
      }

      console.log("Updated playerDetails:", state.playerDetails);
    },
    setCurrentSummoner(state, summoner) {
      state.currentSummoner = summoner;
    },
  },
  actions: {
    deduplicatePlayerDetails({ state, commit }) {
      debugger
      const uniqueDetails = [];
      const seen = new Set();

      state.playerDetails.forEach((detail) => {
        const identifier = `${detail.gameName}:${detail.tagLine}`;
        if (!seen.has(identifier)) {
          seen.add(identifier);
          uniqueDetails.push(detail);
        }
      });

      state.playerDetails = uniqueDetails;
    },
    async updateSummonerDetailsIfNeeded(
      { dispatch, state },
      { gameName, newSummonerLevel, newProfileIconId }
    ) {
      const existingDetail = state.playerDetails.find(
        (detail) => detail.apiResponse && detail.apiResponse.gameName === gameName
      );
      if (
        existingDetail &&
        (existingDetail.apiResponse.summonerLevel !== newSummonerLevel ||
          existingDetail.apiResponse.profileIconId !== newProfileIconId)
      ) {
        // Detected change in summoner level or icon ID, initiate an update
        debug("Summoner details changed, updating...");
        await dispatch("updateSummonerDetails", {
          puuid: existingDetail.apiResponse.puuid,
          summonerLevel: newSummonerLevel,
          profileIconId: newProfileIconId,
        });
      }
    },

    // This action will fetch summoner data from the API and store it
    async fetchSummonerData({ commit, state }, { region, gameName, tagLine, webSocketResponse = null }) {
      console.log(`Fetching summoner data for: ${gameName} with tagLine: ${tagLine}`);

      const currentSummoner = state.currentSummoner;
      if (state.fetchedFromAPI && currentSummoner?.apiResponse) {
        console.log("API data already fetched. Using WebSocket updates only.");
        commit("setPlayerDetails", {
          summonerNameValue: gameName,
          tagLine: tagLine,
          webSocketResponse, // Update WebSocket response
          apiResponse: state.playerDetails.find(detail => detail.gameName === gameName)?.apiResponse || {}, // Keep existing API response
        });
        return;
      }

      if (!currentSummoner?.apiResponse || !state.fetchedFromAPI) {
        try {
          const authConfig = getAuthConfig();
          console.log("Fetching summoner data from API (forced refresh)");

          const apiResponse = await axios.get(`${baseUrl}/summoner/by-riot-id`, {
            ...authConfig,
            params: {
              region,
              gameName,
              tagLine
            },
          });

          if (apiResponse.status !== 200) {
            throw new Error(`HTTP error! status: ${apiResponse.status}`);
          }

          console.log("Summoner data fetched from API:", apiResponse.data);

          const newPlayerDetails = {
            summonerNameValue: gameName,
            tagLine: tagLine,
            webSocketResponse: webSocketResponse || {},
            apiResponse: apiResponse.data[0], // Use the first summoner from API
          };

          commit("setPlayerDetails", newPlayerDetails);
          commit("setCurrentSummoner", newPlayerDetails);
          commit("setFetchedFromAPI", false);
        } catch (error) {
          console.error("Error fetching PlayerDetails:", error);
        }
      }
    },

    async fetchSummonerDataByAccountId({ commit, state }) {
      try {
        const authConfig = getAuthConfig();
        const apiResponse = await axios.get(`${baseUrl}/summoner/data`, { ...authConfig });

        if (apiResponse.data.length === 0) {
          console.log("No summoner data found in the database for this user.");
          return null; // No data found
        }

        const firstSummoner = apiResponse.data[0];
        const newPlayerDetails = {
          gameName: firstSummoner.gameName,
          tagLine: firstSummoner.tagLine,
          apiResponse: firstSummoner,
          webSocketResponse: {}, // Initially empty WebSocket response
        };

        commit("setPlayerDetails", newPlayerDetails);
        commit("setCurrentSummoner", newPlayerDetails);
        return newPlayerDetails; // Return the fetched data
      } catch (error) {
        console.error("Error fetching summoner data by account ID:", error);
        return null;
      }
    }

  },

};
