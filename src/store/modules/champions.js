// Assuming you have these utility functions
import {
    saveToLocalStorage,
    retrieveFromLocalStorage
} from '../plugins/storage.mjs';
import axios from 'axios';
import Debug from 'debug';
const debug = Debug('app:store');

const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export const champions = {
    namespaced: true,
    state: () => ({
        championList: null, // This will store the list of all champions
        championDetails: null, // This will store the detailed info for each champion
        data: retrieveFromLocalStorage('championListData') || null, // Initialize state with data from local storage
    }),
    mutations: {
        SET_CHAMPION_LIST_DATA(state, listData) {
            debug('Setting champion list data:', listData);
            state.championList = listData;
        },
        SET_CHAMPION_DETAILED_DATA(state, detailedData) {
            debug('Setting champion detailed data:', detailedData);
            state.championDetails = detailedData;
        },
    },
    actions: {
        async fetchChampionData({ commit }) {
            // Attempt to load the data from local storage
            let listChampionsData = retrieveFromLocalStorage('championListData');
            let detailedChampionsData = retrieveFromLocalStorage('championDetailedData');
            debug('Champion data loaded from local storage:', listChampionsData, detailedChampionsData);
            // If there's no valid data in local storage, fetch it from the server
            if (!listChampionsData || !detailedChampionsData) {
                try {
                    const response = await axios.get(`http://localhost:3001/api/champions`);
                    debug('Champion data fetched successfully:', response.data);
                    listChampionsData = response.data.list;
                    detailedChampionsData = response.data.details;
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
                debug('Champion data loaded from local storage');
                // Commit the data from local storage to the Vuex store
                commit('SET_CHAMPION_LIST_DATA', listChampionsData);
                commit('SET_CHAMPION_DETAILED_DATA', detailedChampionsData);
            }
        }
    },
    // ... other options ...
};
