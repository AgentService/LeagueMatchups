// store/modules/matchups.js
import Debug from 'debug';
import { getAuthConfig } from './utilities.js';

const debug = Debug('app:store:matchups');

export const matchups = {
	namespaced: true,
	state: {
		championA: null,
		championB: null,
		matchupList: [],
		currentMatchup: null, // Holds the currently selected matchup
	},
	getters: {
		getChampionA: state => state.championA,
		getChampionB: state => state.championB,
		getCurrentMatchup: (state) => state.currentMatchup,
	},
	mutations: {
		SET_CHAMPION_A(state, champion) {
			state.championA = champion;
		},
		SET_CHAMPION_B(state, champion) {
			state.championB = champion;
		},
		CLEAR_MATCHUPS(state) {
			state.matchupList = [];
		},
		SET_CURRENT_MATCHUP(state, matchup) {
			state.championA = matchup.champions[0];
			state.championB = matchup.champions[1];
			state.currentMatchup = matchup;
			debug('Current matchup:', state.currentMatchup);
		},
		ADD_OR_UPDATE_MATCHUP(state, oMatchup) {
			const index = state.matchupList.findIndex((m) => m.id === oMatchup.id);

			if (index !== -1) {
				state.matchupList[index] = oMatchup;
			} else {
				state.matchupList.push(oMatchup);
			}
		},
		UPDATE_NOTES(state, payload) {
			// Find the matchup with the given id
			const matchup = state.matchupList.find(m => m.id === payload.matchupId);

			if (matchup) {
				// Update the notes of the found matchup
				matchup.personalNotes = payload.notes;
			}
		}
	},
	actions: {
		async handleMatchupCreation({ commit, rootState, dispatch }, { id }) {
			// Check if the matchup is already in vuex state
			if (rootState.matchups.matchupList && rootState.matchups.matchupList.length > 0) {
				const existingMatchup = rootState.matchups.matchupList.find((matchup) => matchup.id === id);
				if (existingMatchup) {
					commit('SET_CURRENT_MATCHUP', existingMatchup);
					return existingMatchup;
				}
			}

			const config = getAuthConfig();
			// Fetch the matchup data using fetchDataAndCache
			var matchupData = await dispatch('fetchDataAndCache', {
				module: 'matchups',
				type: 'currentMatchup',
				apiEndpoint: `/api/matchups/${id}`,
				vuexMutation: 'matchups/ADD_OR_UPDATE_MATCHUP',
				skipCacheValidation: true,
				auth: config,
			}, { root: true });

			// Commit the fetched matchup data to Vuex state
			commit('SET_CURRENT_MATCHUP', matchupData);

			return matchupData;
		},
		setChampionA({ commit }, payload) {
			commit('SET_CHAMPION_A', payload);
		},
		setChampionB({ commit }, payload) {
			commit('SET_CHAMPION_B', payload);
		},
		// custom data
		async saveNotes({ dispatch }, payload) {
			try {
				await dispatch('patchDataAndCache', {
					module: 'matchups',
					type: 'notes',
					apiEndpoint: `/api/matchups/${payload.matchupId}/notes`,
					vuexMutation: 'matchups/UPDATE_NOTES',
					data: { personalNotes: payload.notes },
					authConfig: getAuthConfig()
				}, { root: true });
				// Optionally, provide user feedback for success
			} catch (error) {
				// Error handling will be managed by patchDataAndCache
				// Optionally, provide user feedback for error
			}
		},

	},
};
export default matchups; // Make sure this line is present
