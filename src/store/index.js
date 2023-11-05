// store/index.js
import { createStore } from 'vuex';
import { summoner } from './modules/summoner.js';
import { retrieveFromSessionStorage } from './storage.mjs'; // import the function
import { champions } from './modules/champions';

import axios from 'axios';
const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export const store = createStore({
  modules: {
    summoner: summoner,
    champions: champions,
  },
  state: {
    championA: null,
    championB: null,
    matchups: [],
    currentMatchup: null, // Holds the currently selected matchup
    summonerData: retrieveFromSessionStorage('summonerData') || null,
  },
  getters: {
    getChampionA: state => state.championA,
    getChampionB: state => state.championB,
    getCurrentMatchup: (state) => {
      return state.currentMatchup;
    },    // ...other getters
  },
  mutations: {
    CLEAR_MATCHUPS(state) {
      state.matchups = [];
    },
    SET_CURRENT_MATCHUP(state, matchup) {
      state.currentMatchup = matchup;
    },
    ADD_OR_UPDATE_MATCHUP(state, oMatchup) {
      const index = state.matchups.findIndex((m) => m.id === oMatchup.id);

      if (index !== -1) {
        state.matchups[index] = oMatchup;
      } else {
        state.matchups.push(oMatchup);
      }
    },
    UPDATE_NOTES(state, payload) {
      // Find the matchup with the given id
      const matchup = state.matchups.find(m => m.id === payload.matchupId);

      if (matchup) {
        // Update the notes of the found matchup
        matchup.notes = payload.notes;
      }
    },
    setSummonerData(state, data) {
      state.summonerData = data;
      console.log('Updated summoner data in Vuex:', state.summonerData);

      // Save to sessionStorage whenever the summoner data is updated
      saveToSessionStorage('summonerData', data);
      console.log('Summoner data saved to sessionStorage:', retrieveFromSessionStorage('summonerData'));

    },
  },
  actions: {
    async fetchSelectedMatchup({ commit }, matchupId) {
      try {
        const response = await axios.get(`${baseUrl}/api/matchups/${matchupId}`);
        commit('SET_CURRENT_MATCHUP', response.data);
      } catch (error) {
        console.error('Error fetching the matchup:', error);
      }
    },
    async fetchMatchups({ commit }) {
      try {
        const response = await axios.get(`${baseUrl}/api/matchups`);
        commit('SET_MATCHUPS', response.data);
      } catch (error) {
        console.error('An error occurred while fetching the matchups:', error);
      }
    },
    async handleMatchupCreation({ commit }, { id, champions: [championA, championB] }) {
      try {
        const matchupFound = await axios.get(`${baseUrl}/api/matchups/${id}`);

        let matchupData;
        if (matchupFound.data.message === 'Matchup not found') {
          matchupData = {
            id: id,
            champions: [{ id: championA.id, name: championA.name }, { id: championB.id, name: championB.name }],
            notes: ''
          };
          await axios.post(`${baseUrl}/api/matchups/`, matchupData);
          commit('ADD_OR_UPDATE_MATCHUP', matchupData);
        } else {
          matchupData = matchupFound.data;
        }

        // Committing SET_CURRENT_MATCHUP once after the conditions
        commit('SET_CURRENT_MATCHUP', matchupData);
        return matchupData;

      } catch (error) {
        console.error('Error handling the matchup creation:', error);
      }
    },

    // custom data
    saveNotes({ commit }, payload) {
      axios.patch(`${baseUrl}/api/matchups/${payload.matchupId}/notes`, { notes: payload.notes })
        .then(response => {
          commit('UPDATE_NOTES', payload);
        });
    },
    updateSummonerData({ commit }, summonerData) {
      commit('setSummonerData', summonerData);
      // Usage in a Vue component
      // To save data
      // this.$store.dispatch('updateSummonerData', yourSummonerData);
    },
    getSummonerData({ state }) {
      // This will trigger a re-fetch from sessionStorage if needed
      return state.summonerData || retrieveFromSessionStorage('summonerData');
      // const summonerData = this.$store.dispatch('getSummonerData');

    },   
  },
  }

);
