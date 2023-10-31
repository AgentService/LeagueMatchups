// store/index.js
import { createStore } from 'vuex';
import axios from 'axios';

export const store = createStore({

  state: {
    championA: null,
    championB: null,
    matchups: [],
    selectedChampions: [], // Initialize it as an empty array or with default values
  },
  getters: {
    getChampionA: state => state.championA,
    getChampionB: state => state.championB,
    currentMatchup: (state) => {
      return state.matchups.find((matchup) => {
        return (
          matchup.champions.includes(state.championA) &&
          matchup.champions.includes(state.championB)
        );
      });
    },
    // ...other getters
  },
  mutations: {
    SET_CURRENT_MATCHUP(state, matchup) {
      state.currentMatchup = matchup;
    },
    SET_SELECTED_CHAMPIONS(state, payload) {
      state.selectedChampions = payload;
    },
    SET_MATCHUPS(state, matchups) {
      state.matchups = matchups;
    },
    ADD_OR_UPDATE_MATCHUP(state, oMatchup) {
      const index = state.matchups.findIndex((m) => m.id === oMatchup.id);
      
      if (index !== -1) {
        state.matchups[index] = oMatchup;
      } else {
        state.matchups.push(oMatchup);
      }
    },
    CLEAR_MATCHUPS(state) {
      state.matchups = [];
    },
    SET_CHAMPIONS(state, { championA, championB }) {
      state.championA = championA;
      state.championB = championB;
    },

    UPDATE_NOTES(state, payload) {
      // Find the matchup with the given id
      const matchup = state.matchups.find(m => m.id === payload.matchupId);
  
      if (matchup) {
        // Update the notes of the found matchup
        matchup.notes = payload.notes;
      }
    },
  },
      actions: {
        async fetchSelectedMatchup({ commit }, matchupId) {
          try {
            const response = await axios.get(`/api/matchups/${matchupId}`);
            commit('SET_CURRENT_MATCHUP', response.data);
          } catch (error) {
            console.error('Error fetching the matchup:', error);
          }
        },
        fetchChampions({ commit }) {
          axios.get('/api/champions')
            .then(response => {
              commit('SET_CHAMPIONS', response.data);
            })
            .catch(error => {
              console.error('An error occurred while fetching champions:', error);
            });
        },
        async fetchMatchups({ commit }) {
          try {
            const response = await axios.get('http://localhost:3001/api/matchups');
            commit('SET_MATCHUPS', response.data);
          } catch (error) {
            console.error('An error occurred while fetching the matchups:', error);
          }
        },
        setChampions({ commit }, payload) {
          console.log("Action payload: ", payload);

          commit('SET_CHAMPIONS', payload);
        },
        clearMatchups({ commit }) {
          commit('CLEAR_MATCHUPS');
        },
        async createMatchup({ commit, state, dispatch  }, { champions: [championA, championB] }) {
          try {
            const existingMatchup = state.matchups.find((matchup) =>
                matchup.id === `${championA.id}-${championB.id}` || matchup.id === `${championB.id}-${championA.id}`
            );    
        
            if (!existingMatchup) {
              const matchupData = {
                id: `${championA.id}-${championB.id}`,
                champions: [{ id: championA.id, name: championA.name }, { id: championB.id, name: championB.name }],
                notes: '',
                mindset: ''
              };
        
              const response = await axios.post('http://localhost:3001/api/matchups', matchupData);
              commit('ADD_OR_UPDATE_MATCHUP', response.data);
            } 
          } catch (error) {
            console.error('Error creating the matchup:', error);
          }
        },
        // custom data
        saveNotes({ commit }, payload) {
          console.log("Payload: ", payload.matchupId, payload.notes);
          axios.patch(`/api/matchups/${payload.matchupId}/notes`, { notes: payload.notes })
               .then(response => {
                 commit('UPDATE_NOTES', payload);
               });
        }
        }
      }
 );
