// Assuming you have these utility functions
import {
    saveToLocalStorage,
    loadFromLocalStorage
} from '../storage.mjs';
import axios from 'axios';

const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export const champions = {
    namespaced: true,
    state: () => ({
        championList: null, // This will store the list of all champions
        championDetails: null, // This will store the detailed info for each champion
        data: loadFromLocalStorage('championData') || null, // Initialize state with data from local storage
    }),
    mutations: {
        SET_CHAMPION_LIST_DATA(state, listData) {
            state.championList = listData;
        },
        SET_CHAMPION_DETAILED_DATA(state, detailedData) {
            state.championDetails = detailedData;
        },
    },
    actions: {
        async fetchChampionData({ commit }) {
            // Attempt to load the data from local storage
            console.log('Attempting to load champion data from local storage...');
            let listChampionsData = loadFromLocalStorage('championListData');
            let detailedChampionsData = loadFromLocalStorage('championDetailedData');

            // If there's no valid data in local storage, fetch it from the server
            if (!listChampionsData || !detailedChampionsData) {
                console.log('Fetching champion data from server...');
                try {
                    console.log(baseUrl)
                    const response = await axios.get(`http://localhost:3001/api/champions`);
                    console.log('Champion data fetched successfully:', response.data);
                    listChampionsData = response.data.list;
                    detailedChampionsData = response.data.details;
                    console.log('Champion data fetched successfully:', listChampionsData, detailedChampionsData);
                    // Save the newly fetched data to local storage
                    saveToLocalStorage('championListData', listChampionsData);
                    saveToLocalStorage('championDetailedData', detailedChampionsData);

                    // Commit the data to the Vuex store
                    commit('SET_CHAMPION_LIST_DATA', listChampionsData);
                    commit('SET_CHAMPION_DETAILED_DATA', detailedChampionsData);
                } catch (error) {
                    console.error('Error fetching champion data:', error);
                    // Handle error, possibly commit an error state or show notification
                }
            } else {
                console.log('Using champion data from local storage');
                // Commit the data from local storage to the Vuex store
                commit('SET_CHAMPION_LIST_DATA', listChampionsData);
                commit('SET_CHAMPION_DETAILED_DATA', detailedChampionsData);
            }
        }
    },
    // ... other options ...
};
