// store/modules/auth.js
import Debug from "debug";
import axios from "axios";

const debug = Debug("app:store:auth");
const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

export const utilities = {
	namespaced: true,
	state: {
		currentGameVersion: null,
	},
	getters: {
		currentGameVersion: state => state.currentGameVersion
	},
	mutations: {
		// ... other mutations
		SET_GAME_VERSION(state, version) {
			state.currentGameVersion = version;
		},
	},
	actions: {
		async checkAndUpdateVersion({ commit, dispatch, state }) {
			try {
				// Fetch the current game version from the server
				const response = await axios.get(`${baseUrl}/api/utilities/version`);
				const currentVersion = response.data.version;

				// Set the current game version in Vuex
				commit('SET_GAME_VERSION', currentVersion);

				// Additional logic if the version has changed
				if (state.currentGameVersion !== currentVersion) {
					// Dispatch other actions if needed based on version change
					// For example, dispatch('updateGameData') to fetch updated game data
				}
			} catch (error) {
				console.error('Error checking and updating game version:', error);
				// Handle error appropriately
			}
		},
		async initializeApp({ commit, dispatch, state }) {
			if (!localStorage.getItem('dataInitialized')) {
				await dispatch('fetchDataAndCache', {
					module: 'champions',
					type: 'championList',
					apiEndpoint: '/api/champions/list',
					vuexMutation: 'champions/SET_CHAMPION_LIST_DATA',
					skipCacheValidation: false,
				}, { root: true });
				// ... fetch other necessary data
				await dispatch('fetchDataAndCache', {
					module: 'champions',
					type: 'championDetails',
					apiEndpoint: '/api/champions/details',
					vuexMutation: 'champions/SET_ALL_CHAMPION_DETAILS',
					skipCacheValidation: false,
				}, { root: true });
				try {
					// Fetch the current game version from the server
					const response = await axios.get(`${baseUrl}/api/utilities/version`);
					const currentVersion = response.data.version;

					// Set the current game version in Vuex
					commit('SET_GAME_VERSION', currentVersion);

					// Additional logic if the version has changed
					if (state.currentGameVersion !== currentVersion) {
						// Dispatch other actions if needed based on version change
						// For example, dispatch('updateGameData') to fetch updated game data
					}
				} catch (error) {
					console.error('Error checking and updating game version:', error);
					// Handle error appropriately
				}
				localStorage.setItem('dataInitialized', 'true');
			}
		},
	}
};
