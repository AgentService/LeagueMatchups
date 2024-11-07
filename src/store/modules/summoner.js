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
    async fetchOrUpdateSummonerData({ commit }, summonerData) {
      try {
        const authConfig = getAuthConfig();

        // Step 1: Retrieve all summoners associated with the account from the database
        const apiResponse = await axios.get(`${baseUrl}/summoner/data`, { ...authConfig });

        let matchingSummoner = null;

        if (apiResponse.data && apiResponse.data.length > 0) {
          // Step 2: Iterate over each summoner in the response to look for a match
          apiResponse.data.forEach(summoner => {
            const isMatchingSummoner = summoner.gameName === summonerData.gameName && summoner.tagLine === summonerData.tagLine;

            const playerDetails = {
              gameName: summoner.gameName,
              tagLine: summoner.tagLine,
              apiResponse: summoner,
              webSocketResponse: isMatchingSummoner ? summonerData : null
            };

            // Commit each summoner to setPlayerDetails
            commit("setPlayerDetails", playerDetails);

            // If we find a match, save it for setting as currentSummoner
            if (isMatchingSummoner) {
              matchingSummoner = playerDetails;
            }
          });

          // Step 3: If a matching summoner was found, set it as currentSummoner
          if (matchingSummoner) {
            commit("setCurrentSummoner", matchingSummoner);
            return matchingSummoner;
          }
        }

        // Step 4: If no match was found in the database, fetch from Riot API
        const riotApiData = await axios.get(`${baseUrl}/summoner/by-riot-id`, {
          ...authConfig,
          params: {
            region: summonerData.region,
            gameName: summonerData.gameName,
            tagLine: summonerData.tagLine
          }
        });

        if (riotApiData.status === 200 && riotApiData.data.length > 0) {
          const apiData = riotApiData.data[0];
          const playerDetails = {
            gameName: summonerData.gameName,
            tagLine: summonerData.tagLine,
            apiResponse: apiData,
            webSocketResponse: summonerData
          };

          // Commit the newly fetched data to the store
          commit("setPlayerDetails", playerDetails);
          commit("setCurrentSummoner", playerDetails);
          return playerDetails;
        } else {
          console.log("No summoner data found in Riot API for this summoner.");
          return null;
        }
      } catch (error) {
        console.error("Error fetching or updating summoner data:", error);
        return null;
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
