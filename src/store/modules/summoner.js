// store/modules/summoner.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
// If summoner.js is at src/store/modules/summoner.js and storage.js is at src/store/storage.js
import { saveToSessionStorage, retrieveFromSessionStorage } from '../storage.mjs';

export const summoner = {
    namespaced: true,
    state: () => ({
        summonerData: retrieveFromSessionStorage('summonerData') || null,
    }),
    mutations: {
        setSummonerData(state, data) {
            state.summonerData = data;
            // Save to session storage whenever the summoner data is updated
            saveToSessionStorage('summonerData', data);
        },
    },
    actions: {
        async fetchSummonerData({ commit }, summonerName) {
            try {
                console.log('Current summoner data before fetch:', state.summonerData);

                const response = await fetch(`${API_BASE_URL}/summoner/${summonerName}`);
                const data = await response.json();
                console.log('Fetched summoner data:', data);

                // Commit the data to the Vuex store and save it to session storage
                commit('setSummonerData', data);
            } catch (error) {
                console.error('Error fetching summoner data:', error);
                // Handle error, possibly commit an error state or show notification
            }
        },
    },

};


