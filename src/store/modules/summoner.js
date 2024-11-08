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
    setCurrentSummoner(state, summoner) {
      state.currentSummoner = summoner;
    },
    setPlayerDetails(state, { gameName, tagLine, apiResponse = null }) {
      const existingIndex = state.playerDetails.findIndex(
        (detail) => detail.gameName === gameName && detail.tagLine === tagLine
      );

      if (existingIndex !== -1) {
        const existingSummoner = state.playerDetails[existingIndex];

        // Warning log to catch potential overwrites with an empty `apiResponse`
        if (apiResponse && !Object.keys(apiResponse).length) {
          console.warn(`Attempted to overwrite apiResponse with an empty object for Summoner: ${gameName}#${tagLine}`);
        }

        // Update existing entry, but only replace `apiResponse` if a valid `apiResponse` is provided
        state.playerDetails[existingIndex] = {
          ...existingSummoner,
          apiResponse: apiResponse && Object.keys(apiResponse).length ? apiResponse : existingSummoner.apiResponse,
        };
      } else {
        // Add new entry with only `apiResponse`
        const newEntry = {
          gameName: gameName || apiResponse?.gameName || "",
          tagLine: tagLine,
          apiResponse: apiResponse || {},
        };
        state.playerDetails.push(newEntry);
      }
      console.log("Updated playerDetails:", state.playerDetails);
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

        // Step 1: Retrieve all Summoner data from the local database
        const dbResponse = await axios.get(`${baseUrl}/summoner/data`, { ...authConfig });

        let currentSummoner = null;

        // Step 2: Process each summoner from the database response and commit to Vuex
        if (dbResponse.data && dbResponse.data.length > 0) {
          dbResponse.data.forEach((summoner) => {
            const playerDetails = {
              gameName: summoner.gameName,
              tagLine: summoner.tagLine,
              apiResponse: summoner
            };
            debugger
            // Commit each summoner to Vuex; setPlayerDetails will handle adding or updating as needed
            commit("setPlayerDetails", playerDetails);

            // If this summoner matches the one we're specifically fetching, set as currentSummoner
            if (
              summoner.gameName === summonerData.gameName &&
              summoner.tagLine === summonerData.tagLine &&
              summoner.region
            ) {
              currentSummoner = playerDetails;
              commit("setCurrentSummoner", playerDetails);
            }
          });

          // Return the matched summoner if found in the database
          if (currentSummoner) return currentSummoner;
        }

        // Step 3: If no exact match found in the database, fetch from Riot API
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
            apiResponse: apiData
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

    async fetchAllSummoners({ commit, state }) {
      try {
        const authConfig = getAuthConfig();
        const apiResponse = await axios.get(`${baseUrl}/summoner/data`, { ...authConfig });
        debugger
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
          };
          commit("setPlayerDetails", newPlayerDetails);
        });

        // Set the first summoner as the currentSummoner only if it's not already set
        if (!state.currentSummoner) {
          const firstSummoner = apiResponse.data[0];
          const firstSummonerDetails = {
            gameName: firstSummoner.gameName,
            tagLine: firstSummoner.tagLine,
            apiResponse: firstSummoner,
          };
          commit("setCurrentSummoner", firstSummonerDetails);
          console.log("Set first summoner as currentSummoner:", firstSummonerDetails);
        }
      } catch (error) {
        console.error("Error fetching all summoners:", error);
      }
    }
  },
};
