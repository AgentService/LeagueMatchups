// store/index.js
import { createStore } from 'vuex';
import { summoner } from './modules/summoner.js';
import { saveToLocalStorage, retrieveFromLocalStorage } from './plugins/storage.mjs'; // import the function
import { champions } from './modules/champions.js';
import Debug from 'debug';

const debug = Debug('app:components:matchup');

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
    }
  },
  actions: {
    async fetchSelectedMatchup({ commit }, matchupId) {
      debug('Fetching matchup with id:', matchupId);
      try {
        const response = await axios.get(`${baseUrl}/api/matchups/${matchupId}`);
        commit('SET_CURRENT_MATCHUP', response.data);
      } catch (error) {
        console.error('Error fetching the matchup:', error);
      }
    },
    async fetchMatchups({ commit }) {
      debug('Fetching matchups');
      let matchupsData = retrieveFromLocalStorage('matchupsData');

      if (!matchupsData) {
        try {
          debug('Fetching matchups from server');
          const response = await axios.get('/api/matchups');
          matchupsData = response.data;
          saveToLocalStorage('matchupsData', matchupsData);
          commit('SET_MATCHUPS_DATA', matchupsData);
        } catch (error) {
          console.error('Error fetching matchups data:', error);
        }
      } else {
        debug('Matchups loaded from local storage');
        commit('SET_MATCHUPS_DATA', matchupsData);
      }
    },
    async handleMatchupCreation({ commit }, { id, champions: [championA, championB] }) {
      // Check if the matchup is already in local storage
      let matchups = retrieveFromLocalStorage('matchupsData') || {};
      if (!matchups[id]) {
        // Matchup not found in local storage, check the server
        try {
          console.log('Fetching matchup from server');
          debug('Fetching matchup from server');
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
  },
}

);
export default store; // Make sure this line is present
