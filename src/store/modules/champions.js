// Assuming you have these utility functions
import {
	saveToLocalStorage,
	retrieveFromLocalStorage
} from "../plugins/storage.mjs";
import axios from "axios";
import Debug from "debug";
const debug = Debug("app:store:champions");

const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

export const champions = {
	namespaced: true,
	state: () => ({
		championList: null, // This will store the list of all champions
		championDetails: null, // This will store the detailed info for each champion
		data: retrieveFromLocalStorage("championListData") || null, // Initialize state with data from local storage
		championTips: {} // Dieses Objekt wird nur Tipps für jeden Champion speichern
	}),
	getters: {
		getChampionTips: (state) => (championId) => {
			debug("Getting tips for champion", championId);
			// Gibt Tips für den angeforderten Champion zurück, falls vorhanden
			return state.championTips[championId] || [];
		}
	},
	mutations: {
		SET_CHAMPION_LIST_DATA(state, listData) {
			state.championList = listData;
		},
		SET_CHAMPION_DETAILED_DATA(state, detailedData) {
			state.championDetails = detailedData;
		},
		SET_CHAMPION_TIPS(state, { championId, tips }) {
			// Nehmen wir an, `state.champions` ist ein Objekt, das Champions nach ihrer ID speichert
			if (!state.championTips[championId]) {
				// Initialisieren Sie den Eintrag für diesen Champion, falls noch nicht vorhanden
				debug("Initializing tips for champion", championId);
				state.championTips[championId] = tips.championTips;
			}
			// Setzen Sie die Tips für den spezifischen Champion
			debug("Setting tips for champion", championId, tips);
			state.championTips[championId] = tips.championTips;
		}
	},
	actions: {
		async fetchChampionData({ commit }) {
			debug("Fetching champion data");
			// Attempt to load the data from local storage
			let listChampionsData = retrieveFromLocalStorage("championListData");
			let detailedChampionsData = retrieveFromLocalStorage("championDetailedData");
			// If there's no valid data in local storage, fetch it from the server
			if (!listChampionsData || !detailedChampionsData) {
				try {
					const response = await axios.get(`${baseUrl}/api/champions`);
					console.log("Champion data loaded from server:", response.data);
					listChampionsData = response.data.data.list;
					detailedChampionsData = response.data.data.details;
					// Save the newly fetched data to local storage
					saveToLocalStorage("championListData", listChampionsData);
					saveToLocalStorage("championDetailedData", detailedChampionsData);

					// Commit the data to the Vuex store
					commit("SET_CHAMPION_LIST_DATA", listChampionsData);
					commit("SET_CHAMPION_DETAILED_DATA", detailedChampionsData);
				} catch (error) {
					console.error("Error fetching champion data:", error);
					// Handle error, possibly commit an error state or show notification
				}
			} else {
				// Commit the data from local storage to the Vuex store
				commit("SET_CHAMPION_LIST_DATA", listChampionsData);
				commit("SET_CHAMPION_DETAILED_DATA", detailedChampionsData);
			}
		},
		fetchChampionTips({ commit }, champion) {
			const championId = champion.id;
			axios.get(`${baseUrl}/api/champions/${championId}`)
				.then(response => {
					console.log('Champion tips:', response.data);
					commit("SET_CHAMPION_TIPS", { championId, tips: response.data });
				})
				.catch(error => {
					console.error('Error fetching champion tips:', error);
					// Handle error (e.g., show notification)
				});
		},

	},
	// ... other options ...
};
