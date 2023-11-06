// store/modules/summoner.js
import axios from 'axios';
const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
// If summoner.js is at src/store/modules/summoner.js and storage.js is at src/store/storage.js
import { saveToSessionStorage, retrieveFromSessionStorage } from '../plugins/storage.mjs';

export const summoner = {
    namespaced: true,
    state: () => ({
        playerDetails: retrieveFromSessionStorage('playerDetails') || '',
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
              gameName: account?.gameName || '',
              tagLine: account?.tagLine || '',
            };
          },
        summonerName: (state, getters) => {
            return getters.summonerData.name || {};
        },
        profileIconId: (state, getters) => {
            console.log('getters.summonerData', getters.summonerData)
            return state.playerDetails?.summonerData?.profileIconId  || null;
          },
        level: (state, getters) => {
            return state.playerDetails?.summonerData?.summonerLevel || 'Loading...';
        }
        // ... other getters
    },
    mutations: {
        setPlayerDetails(state, data) {
            state.playerDetails = data;
            console.log('Updated summoner data in Vuex:', state.playerDetails);
            // Save to session storage whenever the summoner data is updated
            saveToSessionStorage('playerDetails', data);
        },
    },
    actions: {
        async fetchSummonerData({ commit }, { region, gameName, tagLine }) {
            const playerDetailsKey = 'playerDetails';
            const cachedData = sessionStorage.getItem(playerDetailsKey);

            if (cachedData) {
                console.log('Using cached PlayerDetails');
                commit('setPlayerDetails', JSON.parse(cachedData));
            } else {
                try {
                    console.log('Fetching PlayerDetails from server...');
                    // Call your Node.js server's route, which will then call the Riot API
                    const response = await axios.get(`${baseUrl}/summoner/by-riot-id`, {
                        params: {
                            region: encodeURIComponent(region),
                            gameName: encodeURIComponent(gameName),
                            tagLine: encodeURIComponent(tagLine)
                        }
                    });
                    console.log('Response from server:', response);
                    if (response.status !== 200) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    console.log('Fetched PlayerDetails:', response.data);

                    // Commit the data to the Vuex store and save it to session storage
                    commit('setPlayerDetails', response.data);
                    sessionStorage.setItem(playerDetailsKey, JSON.stringify(response.data));
                } catch (error) {
                    console.error('Error fetching PlayerDetails:', error);
                    // Handle error, possibly commit an error state or show notification
                }
            }
        },
        getSummonerData({ state }) {
            // This will trigger a re-fetch from sessionStorage if needed
            return state.playerDetails || retrieveFromSessionStorage('playerDetails');
            // const summonerData = this.$store.dispatch('getSummonerData');

        },
    },



};


