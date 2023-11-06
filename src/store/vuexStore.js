// store/index.js
import { createStore } from 'vuex';
import { summoner } from './modules/summoner.js';
import { retrieveFromSessionStorage, saveToLocalStorage, loadFromLocalStorage } from './storage.mjs'; // import the function
import { champions } from './modules/champions.js';

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
    playerDetails: retrieveFromSessionStorage('playerDetails') || null,
  },
  getters: {
    getChampionA: state => state.championA,
    getChampionB: state => state.championB,
    getCurrentMatchup: (state) => {
      return state.currentMatchup;
    },    // ...other getters
  },
  mutations: {
    SET_MATCHUPS_DATA(state, matchups) {
      state.matchups = matchups;
    },
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
      let matchupsData = loadFromLocalStorage('matchupsData');

      if (!matchupsData) {
        try {
          const response = await axios.get('/api/matchups');
          matchupsData = response.data;
          saveToLocalStorage('matchupsData', matchupsData);
          commit('SET_MATCHUPS_DATA', matchupsData);
        } catch (error) {
          console.error('Error fetching matchups data:', error);
        }
      } else {
        commit('SET_MATCHUPS_DATA', matchupsData);
      }
    },
    async handleMatchupCreation({ commit }, { id, champions: [championA, championB] }) {
      // Check if the matchup is already in local storage
      let matchups = loadFromLocalStorage('matchupsData') || {};

      if (!matchups[id]) {
        // Matchup not found in local storage, check the server
        try {
          const response = await axios.get(`${baseUrl}/api/matchups/${id}`);
          if (response.data.message === 'Matchup not found') {
            // Create new matchup if it doesn't exist on the server
            const newMatchupData = {
              id: id,
              champions: [{ id: championA.id, name: championA.name }, { id: championB.id, name: championB.name }],
              notes: ''
            };
            await axios.post(`${baseUrl}/api/matchups`, newMatchupData);
            matchups[id] = newMatchupData; // Add new matchup to local object
          } else {
            matchups[id] = response.data; // Use existing matchup from server
          }
        } catch (error) {
          console.error('Error fetching or creating matchup data:', error);
          // Handle error appropriately
        }
      }

      // At this point, matchups[id] is either loaded from local storage, fetched from the server, or created new
      saveToLocalStorage('matchupsData', matchups); // Save updated matchups object to local storage
      commit('SET_CURRENT_MATCHUP', matchups[id]); // Commit to Vuex state

      // If you need to update the list of matchups in the state as well
      commit('ADD_OR_UPDATE_MATCHUP', matchups[id]);

      return matchups[id]; // Return the matchup data
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
