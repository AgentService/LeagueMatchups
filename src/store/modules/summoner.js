// store/modules/summoner.js
import axios from 'axios';
const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
// If summoner.js is at src/store/modules/summoner.js and storage.js is at src/store/storage.js
import { saveToSessionStorage, retrieveFromSessionStorage } from '../storage.mjs';

export const summoner = {
    namespaced: true,
    state: () => ({
        playerDetails: retrieveFromSessionStorage('playerDetails') || null,
    }),
    mutations: {
        setSummonerData(state, data) {
            state.playerDetails = data;
            console.log('Updated summoner data in Vuex:', state.playerDetails);
            // Save to session storage whenever the summoner data is updated
            saveToSessionStorage('playerDetails', data);
        },
    },
    actions: {
        async fetchSummonerData({ commit }, { region, gameName, tagLine }) {
          try {
            console.log('Fetching summoner data from server...');
            // Call your Node.js server's route, which will then call the Riot API
            const response = await axios.get(`${baseUrl}/summoner/by-riot-id?region=${encodeURIComponent(region)}&gameName=${encodeURIComponent(gameName)}&tagLine=${encodeURIComponent(tagLine)}`);
            console.log('Response from server:', response);
            if (response.status !== 200) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }

            console.log('Fetched summoner data:', response.data);
      
            // Commit the data to the Vuex store and save it to session storage
            commit('setSummonerData', response.data);
            sessionStorage.setItem('playerDetails', JSON.stringify(response.data));
          } catch (error) {
            console.error('Error fetching summoner data:', error);
            // Handle error, possibly commit an error state or show notification
          }
        },
      },
      


};


