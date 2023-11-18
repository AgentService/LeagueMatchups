// Assuming you have these utility functions
import {
	retrieveFromLocalStorage,
	fetchDataAndCache,
} from "../plugins/storage.mjs";
import axios from "axios";
import Debug from "debug";
const debug = Debug("app:store:champions");

const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

export const champions = {
	namespaced: true,
	state: () => ({
		championList: null, // This will store the list of all champions
		championDetails: {}, // Initialize as an empty object
		data: retrieveFromLocalStorage("championListData") || null, // Initialize state with data from local storage
		championTips: {}, // Dieses Objekt wird nur Tipps für jeden Champion speichern
		currentGameVersion: null
	}),
	getters: {
		getChampionTips: (state) => (championId) => {
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
		SET_ALL_CHAMPION_DETAILS(state, detailedData) {
			state.championDetails = detailedData;
		},
		SET_CHAMPION_TIPS(state, { championId, tips }) {
			// Nehmen wir an, `state.champions` ist ein Objekt, das Champions nach ihrer ID speichert
			if (!state.championTips[championId]) {
				// Initialisieren Sie den Eintrag für diesen Champion, falls noch nicht vorhanden
				state.championTips[championId] = tips.championTips;
			}
			// Setzen Sie die Tips für den spezifischen Champion
			debug("Setting tips for champion", championId, tips);
			state.championTips[championId] = tips.championTips;
		}
	},
	actions: {
		async retrieveChampionData({ commit }) {
			const championsData = await fetchDataAndCache({
				commit,
				type: "championList",
				apiEndpoint: "/api/champions/list",
				vuexMutation: "SET_CHAMPION_LIST_DATA",
				storageType: "local",
				skipCacheValidation: false
			});

			return championsData;
		},
		async retrieveChampionDetails({ commit }) {
			const championDetailedData = await fetchDataAndCache({
				commit,
				type: "championDetails",
				apiEndpoint: "/api/champions/details",
				vuexMutation: "SET_ALL_CHAMPION_DETAILS",
				storageType: "local",
				skipCacheValidation: false
			});

			return championDetailedData;
		},
		async updateDataIfNeeded({ commit }) {
			try {
				// Use the fetchDataAndCache function for champion list data
				await fetchDataAndCache({
					commit,
					type: "championList",
					apiEndpoint: "/api/champions",
					vuexMutation: "SET_CHAMPION_LIST_DATA",
					storageType: "local",
					skipCacheValidation: false
				});
				await fetchDataAndCache({
					commit,
					type: "championDetails",
					apiEndpoint: "/api/champions/details",
					vuexMutation: "SET_ALL_CHAMPION_DETAILS",
					storageType: "local",
					skipCacheValidation: false
				});
			} catch (error) {
				console.error("Error updating data:", error);
				// Handle the error appropriately
			}
		},
		// async retrieveChampionData({ commit, state }) {
		// 	const storedVersion = retrieveFromLocalStorage("gameVersion");
		// 	const serverVersionResponse = await axios.get(`${baseUrl}/api/utilities/version`);
		// 	const serverVersion = serverVersionResponse.data.version;

		// 	if (serverVersion !== storedVersion) {
		// 		// Fetch new champion data from the server
		// 		const listResponse = await axios.get(`${baseUrl}/api/champions`);
		// 		const detailsResponse = await axios.get(`${baseUrl}/api/champions/details`);

		// 		// Save the new data to local storage
		// 		saveToLocalStorage("championList", listResponse.data);
		// 		saveToLocalStorage("championDetails", detailsResponse.data);
		// 		saveToLocalStorage("gameVersion", serverVersion);

		// 		// Commit the data to Vuex
		// 		commit("SET_CHAMPION_LIST_DATA", listResponse.data);
		// 		commit("SET_ALL_CHAMPION_DETAILS", detailsResponse.data);
		// 	} else {
		// 		// Use data from local storage
		// 		const listData = retrieveFromLocalStorage("championList");
		// 		const detailsData = retrieveFromLocalStorage("championDetails");

		// 		if (listData && detailsData) {
		// 			commit("SET_CHAMPION_LIST_DATA", listData);
		// 			commit("SET_ALL_CHAMPION_DETAILS", detailsData);
		// 		} else {
		// 			// If the local storage data is incomplete, fetch from server
		// 			// This part is similar to the above fetching logic
		// 		}
		// 	}
		// },

		// async fetchChampionData({ commit }) {
		// 	debug("Fetching champion data");

		// 	const storedVersion = retrieveFromLocalStorage("gameVersion");
		// 	try {
		// 		const serverVersionResponse = await axios.get(`${baseUrl}/api/utilities/version`);
		// 		const serverVersion = serverVersionResponse.data.version;

		// 		if (serverVersion !== storedVersion) {
		// 			// Fetch new champion list from the server
		// 			const listResponse = await axios.get(`${baseUrl}/api/champions`);
		// 			const listChampionsData = listResponse.data.data.list;

		// 			// Save the newly fetched list data to local storage and Vuex store
		// 			saveToLocalStorage("championListData", listChampionsData);
		// 			commit("SET_CHAMPION_LIST_DATA", listChampionsData);

		// 			// Save the new version to local storage
		// 			saveToLocalStorage("gameVersion", serverVersion);
		// 		} else {
		// 			// Use data from local storage
		// 			const listChampionsData = retrieveFromLocalStorage("championListData");
		// 			commit("SET_CHAMPION_LIST_DATA", listChampionsData);
		// 		}
		// 	} catch (error) {
		// 		console.error("Error fetching champion data:", error);
		// 		// Handle error, possibly commit an error state or show notification
		// 	}
		// },
		// async fetchAllChampionDetails({ commit }) {
		// 	let storedDetails = retrieveFromLocalStorage("championDetailedData");
		// 	storedDetails = storedDetails || {};  // Use an empty object if storedDetails is null
		// 	console.log('storedDetails:', storedDetails);
		// 	if (storedDetails) {
		// 		commit("SET_ALL_CHAMPION_DETAILS", storedDetails);
		// 	} else if (typeof state.championDetails === 'undefined') {
		// 		try {
		// 			const response = await axios.get(`${baseUrl}/api/champions/details`);
		// 			commit("SET_ALL_CHAMPION_DETAILS", response.data);
		// 		} catch (error) {
		// 			console.error("Error fetching all champion details:", error);
		// 			// Handle error appropriately
		// 		}
		// 	}
		// },
		fetchChampionTips({ commit }, champion) {
			const championId = champion.id;
			axios.get(`${baseUrl}/api/champions/${championId}/tips`)
				.then(response => {
					console.log("Champion tips:", response.data);
					commit("SET_CHAMPION_TIPS", { championId, tips: response.data });
				})
				.catch(error => {
					console.error("Error fetching champion tips:", error);
					// Handle error (e.g., show notification)
				});
		},

	},
	// ... other options ...
};
