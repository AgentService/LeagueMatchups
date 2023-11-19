// store/index.js
import { createStore } from 'vuex';
import { summoner } from './modules/summoner.js';
import matchups from './modules/matchups.js'; // Import the new matchups module
import { champions } from './modules/champions.js';
import { auth } from './modules/auth.js';
import { utilities } from './modules/utilities.js';

import VuexPersistence from 'vuex-persist';
import axios from 'axios';

const vuexLocal = new VuexPersistence({
	storage: window.localStorage, // or window.sessionStorage
	modules: ['champions', 'matchups', 'utilities'] // Specify modules to persist
});
const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
const VERSION_ENDPOINT = `${baseUrl}/api/utilities/version`; // Adjust the URL as needed

export const store = createStore({
	modules: {
		summoner: summoner,
		champions: champions,
		matchups: matchups,
		auth: auth,
		utilities: utilities
	},

	actions: {
		/* GENERIC UTILITY FUNCTION
		* Fetches data from an API endpoint and caches it. If the data is already cached
		* and is valid, it uses the cached data instead of fetching from the API.
		* 
		* @param {Object} options - The options for fetching and caching data.
		* @param {string} options.type - The type of data being handled (e.g., 'championData').
		* @param {string} options.apiEndpoint - The API endpoint to fetch data from.
		* @param {string} options.vuexMutation - The Vuex mutation type to commit the fetched data.
		* @param {Function} options.commit - The Vuex `commit` function to update the state.
		* @param {string} [options.storageType='local'] - The type of storage to use ('local' or 'session').
		* @param {boolean} [options.skipCacheValidation=false] - Whether to skip cache validation and always fetch new data.
		* @returns {Promise<Object>} A promise that resolves to the fetched (or cached) data.
		*/
		// Modify fetchDataAndCache to only fetch data based on options
		async fetchDataAndCache({ commit, state }, options) {
			const { module, type, apiEndpoint, vuexMutation, skipCacheValidation = false, authConfig = {} } = options;

			// Use data from Vuex state if available and valid
			if (!skipCacheValidation && state[module][type] !== null && !isEmpty(state[module][type])) {
				return state[module][type];
			}

			// Fetch data based on provided options
			const dataResponse = await axios.get(`${baseUrl}` + apiEndpoint, authConfig);
			if (dataResponse.status === 200 || dataResponse.status === 201) {
				const data = dataResponse.data;
				commit(vuexMutation, data);
				return data;
			}

			return null; // Handle errors or no data found
		},
	},
	plugins: [vuexLocal.plugin],

});
function isEmpty(obj) {
	return obj && Object.keys(obj).length === 0 && obj.constructor === Object;
}
export default store; // Make sure this line is present
