import { getAuthConfig } from "./utilities.js";
import { getUrlHelper } from '../../renderer/globalSetup';
import axios from "axios";
import Debug from "debug";
const debug = Debug("app:store:matches");

const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

const defaultState = () => ({
  summonerMatches: {}, // Store match histories per summoner keyed by PUUID
  reviewedMatches: {}, // Object to track reviewed match IDs
  lastFetchTime: {}, // Store the last fetch time for each summoner
});

export const matches = {
  namespaced: true,
  state: defaultState(),
  getters: {
    getMatchHistory: (state) => (puuid) => state.summonerMatches[puuid] || [], // Get match history for the current summoner

    isMatchReviewed: (state) => (gameId) => !!state.reviewedMatches[gameId],
    getReviewedMatches: (state) => Object.keys(state.reviewedMatches),

    getPuuid: (state, getters, rootState) => {
      return rootState.summoner.currentSummoner?.apiResponse?.puuid || rootState.summoner.currentSummoner?.webSocketResponse?.puuid;
    },
    getPlayerChampion: (state, getters) => (match) => {
      const puuid = getters.getPuuid;
      const participant = match.info?.participants?.find(participant => participant.puuid === puuid);
      return participant || null;
    },

    calculateKDA: () => (participant) => {
      const kills = participant?.kills || 0;
      const deaths = participant?.deaths || 1; // Avoid division by 0
      const assists = participant?.assists || 0;
      return ((kills + assists) / deaths).toFixed(2);
    },
    calculateCsPerMinute: () => (participant, match) => {
      const cs = participant?.totalMinionsKilled || 0;
      const gameDurationMinutes = match.info?.gameDuration / 60;
      return (cs / gameDurationMinutes).toFixed(2);
    },
    calculateVisionScorePerMinute: () => (participant, match) => {
      const visionScore = participant?.visionScore || 0;
      const gameDurationMinutes = match.info?.gameDuration / 60;
      return (visionScore / gameDurationMinutes).toFixed(2);
    },
    getChampionImageSource: () => (type, championName) => {
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
      const participant = match.info?.userParticipant || {};
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
    RESET_STATE(state) {
      Object.assign(state, defaultState());
    },
    SET_SUMMONER_MATCHES(state, { puuid, matches }) {
      state.summonerMatches[puuid] = matches; // Store matches per summoner's PUUID
    },
    MARK_MATCH_REVIEWED(state, gameId) {
      state.reviewedMatches[gameId] = true; // Mark match as reviewed
    },
  },
  actions: {
    // Fetch match history for the current summoner
    async fetchLastMatch({ commit, state, dispatch, rootGetters }, { forceRefresh = false, count = 5 } = {}) {
      // Get currentSummoner from the summoner module
      const currentSummoner = rootGetters['summoner/getCurrentSummoner'];

      if (!currentSummoner) {
        console.error("No current summoner is selected.");
        return;
      }

      // Extract the puuid from the currentSummoner (either from apiResponse or webSocketResponse)
      const puuid = currentSummoner.apiResponse?.puuid;

      if (!puuid) {
        console.error("Player PUUID is not available.");
        return;
      }

      // Use cached data if available and recent
      const now = Date.now();
      const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
      if (state.summonerMatches[puuid] && now - state.lastFetchTime < CACHE_DURATION && !forceRefresh) {
        console.log("Using cached match data.");
        return state.summonerMatches[puuid]; // Return cached matches for this summoner
      }

      const config = getAuthConfig();

      const options = {
        module: "matches",
        type: "matchHistory",
        apiEndpoint: `/api/matches/last-match/${puuid}?count=${count}`, // Use `count` here
        vuexMutation: "matches/SET_SUMMONER_MATCHES",
        itemId: puuid,
        commit,
        state,
        auth: config,
      };

      try {
        debug("Fetching last match for:", currentSummoner.apiResponse?.gameName);
        const data = await dispatch("fetchDataAndCache", options, { root: true });

        commit("SET_SUMMONER_MATCHES", { puuid, matches: data });
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
