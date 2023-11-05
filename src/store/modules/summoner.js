// store/modules/summoner.js
const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
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
            console.log('Updated summoner data in Vuex:', state.summonerData);
            // Save to session storage whenever the summoner data is updated
            saveToSessionStorage('summonerData', data);
        },
    },
    actions: {
        async fetchSummonerData({ commit }, summonerName) {
            try {
                const region = 'euw1'; // TODO: Get this from the user
                const response = await fetch(`${baseUrl}/summoner/${region}/${summonerName}`);
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


