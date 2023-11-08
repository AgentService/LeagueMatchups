// store/modules/summoner.js
import axios from "axios";
const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";
// If summoner.js is at src/store/modules/summoner.js and storage.js is at src/store/storage.js
import { saveToLocalStorage, retrieveFromLocalStorage } from "../plugins/storage.mjs";
import Debug from "debug";
const debug = Debug("app:store:summoner");

export const summoner = {
	namespaced: true,
	state: () => ({
		playerDetails: retrieveFromLocalStorage("playerDetails") || "",
	}),
	getters: {
		accountData: (state) => {
			return state.playerDetails?.accountData || {};
		},
		summonerData: (state) => {
			return state.playerDetails?.summonerData || {};
		},
		riotIdParts: (state) => {
			// Directly access the state to get accountData
			const account = state.playerDetails?.accountData;
			// Return an object with both gameName and tagLine
			return {
				gameName: account?.gameName || "",
				tagLine: account?.tagLine || "",
			};
		},
		summonerName: (getters) => {
			return getters.summonerData.name || {};
		},
		profileIconId: (state) => {
			return state.playerDetails?.summonerData?.profileIconId || null;
		},
		level: (state) => {
			return state.playerDetails?.summonerData?.summonerLevel || "Loading...";
		}
		// ... other getters
	},
	mutations: {
		setPlayerDetails(state, data) {
			state.playerDetails = data;
		},
	},
	actions: {
		async fetchSummonerData({ commit }, { region, gameName, tagLine }) {
			const playerDetailsKey = "playerDetails";
			const cachedData = retrieveFromLocalStorage(playerDetailsKey);
			if (cachedData) {
				debug("Summoner data loaded from cache:", cachedData);
				commit("setPlayerDetails", cachedData);
			} else {
				try {
					debug("Fetching summoner data");
					// Call your Node.js server's route, which will then call the Riot API
					const response = await axios.get(`${baseUrl}/summoner/by-riot-id`, {
						params: {
							region,
							gameName,
							tagLine
						}
					});

					if (response.status !== 200) {
						throw new Error(`HTTP error! status: ${response.status}`);
					}
					// Commit the data to the Vuex store and save it to localStorage 
					commit("setPlayerDetails", response.data);
					saveToLocalStorage(playerDetailsKey, response.data);
				} catch (error) {
					console.error("Error fetching PlayerDetails:", error);
				}
			}
		},
		// getSummonerData({ state }) {
		//     // This will trigger a re-fetch from localStorage if needed
		//     return state.playerDetails || retrieveFromLocalStorage('playerDetails');
		//     // const summonerData = this.$store.dispatch('getSummonerData');

		// },
	},
};


