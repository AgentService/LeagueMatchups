// store/modules/summoner.js
import axios from "axios";
import { getAuthConfig } from "./utilities.js";
import Debug from "debug";
const debug = Debug("app:store:summoner");
import {
  initializeSummonerDataFetching,
  startSummonerNameCheck,
} from "../../services/summonerDataService.js";


const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

const defaultState = () => ({
  playerDetails: [],
  currentSummoner: null,
  fetchedFromAPI: false,
});

export const summoner = {
  namespaced: true,
  state: defaultState(),
  getters: {
    getSummonerDataByName: (state) => (gameName) => {
      return state.playerDetails.find(detail => detail.gameName === gameName) || null;
    },
    getCurrentSummoner: (state) => state.currentSummoner,
    getAllPlayerDetails: (state) => state.playerDetails,
  },
  mutations: {
    RESET_STATE(state) {
      Object.assign(state, defaultState());
    },
    setFetchedFromAPI(state, status) {
      state.fetchedFromAPI = status;
    },
    setPlayerDetails(state, { gameName, tagLine, webSocketResponse = null, apiResponse = null }) {
      const existingIndex = state.playerDetails.findIndex(
        (detail) => detail.gameName === gameName && detail.tagLine === tagLine
      );


      if (existingIndex !== -1) {
        const existingSummoner = state.playerDetails[existingIndex];
        state.playerDetails[existingIndex] = {
          ...existingSummoner,
          webSocketResponse: webSocketResponse || existingSummoner.webSocketResponse,
          apiResponse: apiResponse || existingSummoner.apiResponse,
        };
      } else {
        const newEntry = {
          gameName: gameName || apiResponse?.gameName || "",
          tagLine: tagLine,
          webSocketResponse: webSocketResponse || {},
          apiResponse: apiResponse || {},
        };
        state.playerDetails.push(newEntry);
      }

      console.log("Updated playerDetails:", state.playerDetails);
    },
    setCurrentSummoner(state, summoner) {
      state.currentSummoner = summoner;
    },
  },
  actions: {
    // Add this action to your store
    async initializeSummonerData({ dispatch }) {
      try {
        debugger
        // Define getClientStatus here if it’s not globally accessible
        async function getClientStatus() {
          try {
            const status = await window.api.checkClientStatus(); // Adjust the call to match your API
            return status.connected; // Assuming `status.connected` indicates client activity
          } catch (error) {
            console.error('Error checking client status:', error);
            return false;
          }
        }

        // Check if the client is active
        const isClientActive = await getClientStatus();
        console.log('Client active:', isClientActive);

        if (isClientActive) {
          // Start data fetching processes if client is active
          initializeSummonerDataFetching();
          startSummonerNameCheck();
        } else {
          await dispatch('fetchAllSummoners');
        }
      } catch (error) {
        console.error('Error initializing summoner data:', error);
      }
    },
    deduplicatePlayerDetails({ state, commit }) {
      const uniqueDetails = [];
      const seen = new Set();

      state.playerDetails.forEach((detail) => {
        const identifier = `${detail.gameName}:${detail.tagLine}`;
        if (!seen.has(identifier)) {
          seen.add(identifier);
          uniqueDetails.push(detail);
        }
      });

      commit('RESET_STATE');
      uniqueDetails.forEach(detail => {
        commit('setPlayerDetails', detail);
      });
    },
    async fetchSummonerDataBySummonerData({ commit }, summonerData) {
      try {
        const authConfig = getAuthConfig();
        const apiResponse = await axios.get(`${baseUrl}/summoner/data`, { ...authConfig });

        if (apiResponse.data.length === 0) {
          console.log("No summoner data found in the database for this user.");
          return null; // No data found
        }

        // Find the summoner matching the provided gameName and tagLine
        const summoner = apiResponse.data.find(
          (s) => s.gameName === summonerData.gameName && s.tagLine === summonerData.tagLine
        );

        if (!summoner) {
          console.log("No matching summoner data found in the database.");
          return null;
        }

        const newPlayerDetails = {
          gameName: summoner.gameName,
          tagLine: summoner.tagLine,
          apiResponse: summoner,
          webSocketResponse: summonerData, // Use the received summonerData as WebSocket response
        };

        commit("setPlayerDetails", newPlayerDetails);
        commit("setCurrentSummoner", newPlayerDetails);
        return newPlayerDetails; // Return the fetched data
      } catch (error) {
        console.error("Error fetching summoner data by account ID:", error);
        return null;
      }
    },

    async fetchSummonerData({ commit }, { region, gameName, tagLine }) {
      console.log(`Fetching summoner data for: ${gameName} with tagLine: ${tagLine}`);

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
          gameName,
          tagLine,
          webSocketResponse: {},
          apiResponse: apiResponse.data[0],
        };

        commit("setPlayerDetails", newPlayerDetails);
        commit("setCurrentSummoner", newPlayerDetails);
        commit("setFetchedFromAPI", false);
      } catch (error) {
        console.error("Error fetching PlayerDetails:", error);
      }
    },
    async fetchAllSummoners({ commit }) {
      try {
        const authConfig = getAuthConfig();
        const apiResponse = await axios.get(`${baseUrl}/summoner/data`, { ...authConfig });

        if (apiResponse.data.length === 0) {
          console.log("No summoner data found in the database for this user.");
          return; // No data found
        }

        // Commit each summoner to the store
        apiResponse.data.forEach((summoner) => {
          const newPlayerDetails = {
            gameName: summoner.gameName,
            tagLine: summoner.tagLine,
            apiResponse: summoner,
            webSocketResponse: {}, // Initially empty WebSocket response
          };
          commit("setPlayerDetails", newPlayerDetails);
        });

        // Set the first summoner as the currentSummoner
        const firstSummoner = apiResponse.data[0];
        const firstSummonerDetails = {
          gameName: firstSummoner.gameName,
          tagLine: firstSummoner.tagLine,
          apiResponse: firstSummoner,
          webSocketResponse: {},
        };
        commit("setCurrentSummoner", firstSummonerDetails);
        console.log("Set first summoner as currentSummoner:", firstSummonerDetails);
      } catch (error) {
        console.error("Error fetching all summoners:", error);
      }
    },
  },
};
