import axios from "axios";
import { getAuthConfig } from "./utilities.js";
import { getUrlHelper } from '../../renderer/globalSetup';

const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

export const matches = {
  namespaced: true,
  state: () => ({
    matchHistory: null,
    reviewedMatches: {}, // Object to track reviewed match IDs
    lastFetchTime: null, // To store the last fetch time for caching
  }),
  getters: {
    getMatchHistory: (state) => state.matchHistory,
    isMatchReviewed: (state) => (gameId) => !!state.reviewedMatches[gameId],
    getReviewedMatches: (state) => Object.keys(state.reviewedMatches),
    getPuuid: (state, getters, rootState) => {
      return rootState.summoner.playerDetails[0]?.puuid;
    },
    getPlayerChampion: (state, getters) => (match) => {
      // Check if the data is from WebSocket by looking at the number of participants
      const isWebSocketData = match.info.participants.length === 1;

      if (isWebSocketData) {
        // If it's WebSocket data, return the only participant available
        return match.info.participants[0];
      } else {
        // If it's API data, use the PUUID to find the correct participant
        const puuid = getters.getPuuid;
        const bValue = match.info.participants.find(participant => participant.puuid === puuid);
        if (!bValue) {
          console.warn("Participant not found for the given PUUID:", puuid);
        }
        return bValue;
      }
    },
  
    calculateKDA: () => (participant) => {
      if (!participant) {
        debugger
        return "0.00"; // Default value if participant is not available
      }
      const kills = participant.kills || 0;
      const deaths = participant.deaths || 1; // Prevent division by zero
      const assists = participant.assists || 0;
      return ((kills + assists) / deaths).toFixed(2);
    },
    calculateCsPerMinute: () => (participant, match) => {
      const cs = participant.totalMinionsKilled || 0;
      const gameDurationMinutes = match.info.gameDuration / 60;
      return (cs / gameDurationMinutes).toFixed(2);
    },
    calculateVisionScorePerMinute: () => (participant, match) => {
      const visionScore = participant.visionScore || 0;
      const gameDurationMinutes = match.info.gameDuration / 60;
      return (visionScore / gameDurationMinutes).toFixed(2);
    },
    getChampionImageSource: () => (type, championName) => {
      if (!championName) {
        debugger
        return ""; // Return early if no champion
      }
      const urlHelper = getUrlHelper();
      return urlHelper.getChampionImageSource(type, championName);
    },
    getItemImageSource: () => (itemId) => {
      const urlHelper = getUrlHelper();
      return urlHelper.getItemImageUrl(itemId);
    },
    calculateTimeSinceMatch: () => (gameCreation) => {
      const now = Date.now();
      const diffInMs = now - gameCreation;
      const diffInHours = diffInMs / (1000 * 60 * 60);
      return `${Math.floor(diffInHours)} hours ago`;
    },
    getPlayerChampionAndItems: () => (match) => {
      const participant = match.info.userParticipant || {};
      return {
        championId: participant.championId || '',
        items: [
          participant.item0,
          participant.item1,
          participant.item2,
          participant.item3,
          participant.item4,
          participant.item5,
          participant.item6,
        ],
      };
    },
  },
  mutations: {
    SET_MATCH_HISTORY(state, match) {
      state.matchHistory = match;
    },
    MARK_MATCH_REVIEWED(state, gameId) {
      state.reviewedMatches[gameId] = true; // Mark the match as reviewed
    },
  },
  actions: {
    async fetchLastMatch({ commit, state, dispatch }, summonerId) {
      const puuid = summonerId;
      const count = 5; // Number of matches to fetch

      if (!puuid) {
        console.error("PUUID is missing");
        return;
      }

      // Use cached data if available and recent
      const now = Date.now();
      const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
      if (state.matchHistory && now - state.lastFetchTime < CACHE_DURATION) {
        console.log("Using cached match data.");
        return state.matchHistory;
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
        const data = await dispatch("fetchDataAndCache", options, { root: true });

        commit("SET_MATCH_HISTORY", data);
        state.lastFetchTime = Date.now(); // Update the last fetch time
      } catch (error) {
        console.error("Error fetching the last match:", error);
      }
    },
    addReviewedMatch({ commit }, matchReview) {
      commit("MARK_MATCH_REVIEWED", matchReview.gameId);
    },
  },
};

export default matches;
