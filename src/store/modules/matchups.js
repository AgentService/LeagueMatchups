// store/modules/matchups.js
import axios from "axios";
import { saveToLocalStorage, retrieveFromLocalStorage } from "../plugins/storage.mjs";
import Debug from "debug";

const debug = Debug("app:store:matchups");
const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";
const authToken = 'x'; // Replace with your actual authentication token

const config = {
  headers: {
    Authorization: `Bearer ${authToken}`, // Include the token in the "Authorization" header
  },
};
export const matchups = {
	namespaced: true,
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
			console.log('getCurrentMatchup', state.currentMatchup);
			return state.currentMatchup;
		},    // ...other getters
	},
	mutations: {
		SET_CHAMPION_A(state, champion) {
			state.championA = champion;
		},
		SET_CHAMPION_B(state, champion) {
			state.championB = champion;
		},
		SET_MATCHUPS_DATA(state, matchups) {
			state.matchups = matchups;
		},
		CLEAR_MATCHUPS(state) {
			state.matchups = [];
		},
		SET_CURRENT_MATCHUP(state, matchup) {
			state.championA = matchup.champions[0];
			state.championB = matchup.champions[1];
			state.currentMatchup = matchup;
			debug("Current matchup:", state.currentMatchup)
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
		// async fetchSelectedMatchup({ commit }, matchupId) {
		//     debug('Fetching matchup with id:', matchupId);
		//     try {
		//         const response = await axios.get(`${baseUrl}/api/matchups/${matchupId}`);
		//         commit('SET_CURRENT_MATCHUP', response.data);
		//     } catch (error) {
		//         console.error('Error fetching the matchup:', error);
		//     }
		// },
		// async fetchMatchups({ commit }) {
		//     debug('Fetching matchups');
		//     let matchupsData = retrieveFromLocalStorage('matchupsData');

		//     if (!matchupsData) {
		//         try {
		//             debug('Fetching matchups from server');
		//             const response = await axios.get('/api/matchups');
		//             matchupsData = response.data;
		//             saveToLocalStorage('matchupsData', matchupsData);
		//             commit('SET_MATCHUPS_DATA', matchupsData);
		//         } catch (error) {
		//             console.error('Error fetching matchups data:', error);
		//         }
		//     } else {
		//         debug('Matchups loaded from local storage');
		//         commit('SET_MATCHUPS_DATA', matchupsData);
		//     }
		// },
		async handleMatchupCreation({ commit }, { id, champions: [championA, championB] }) {
			// Check if the matchup is already in local storage
			let matchups = retrieveFromLocalStorage("matchupsData") || {};
			if (!matchups[id]) {
				// Matchup not found in local storage, check the server
				try {
					debug("Fetching matchup from server");
					const response = await axios.get(`${baseUrl}/api/matchups/${id}`);
					if (response.data.message === "Matchup not found") {
						// Create new matchup if it doesn't exist on the server
						const newMatchupData = {
							id: id,
							champions: [{ id: championA.id, name: championA.name }, { id: championB.id, name: championB.name }],
							notes: ""
						};
						await axios.post(`${baseUrl}/api/matchups`, newMatchupData);
						matchups[id] = newMatchupData; // Add new matchup to local object
					} else {
						matchups[id] = response.data; // Use existing matchup from server
					}
				} catch (error) {
					console.error("Error fetching or creating matchup data:", error);
					// Handle error appropriately
				}
			}

			// At this point, matchups[id] is either loaded from local storage, fetched from the server, or created new
			commit("SET_CURRENT_MATCHUP", matchups[id]); // Commit to Vuex state
			debug("Matchup data:", matchups[id])
			// If you need to update the list of matchups in the state as well
			commit("ADD_OR_UPDATE_MATCHUP", matchups[id]);

			return matchups[id]; // Return the matchup data
		},
		setChampionA({ commit }, payload) {
			commit("SET_CHAMPION_A", payload);
		},
		setChampionB({ commit }, payload) {
			commit("SET_CHAMPION_B", payload);
		},
		// custom data
		saveNotes({ commit, state }, payload) {
			axios.patch(`${baseUrl}/api/matchups/${payload.matchupId}/notes`, { notes: payload.notes }, config)
				.then(response => {
					debug("Notes updated:", response.data);
					commit("UPDATE_NOTES", payload);

					// Save the entire updated matchups object to LocalStorage
					saveToLocalStorage("matchupsData", state.matchups);
				})
				.catch(error => {
					console.error("Error updating notes:", error);
					// Handle error appropriately
				});
		},
	},
};

export default matchups; // Make sure this line is present
