import {
  saveToLocalStorage,
  retrieveFromLocalStorage,
} from "../plugins/storage.mjs";

// src/store/userPreferences.js
export const userPreferences = {
  namespaced: true,
  state: {
    favoriteChampions: [],
    displaySettings: {
      theme: "dark", // Default theme
      notifications: true, // Enable notifications by default
    },
    // Add other user preferences here
  },
  mutations: {
    SET_FAVORITE_CHAMPIONS(state, champions) {
      state.favoriteChampions = champions;
    },
    TOGGLE_THEME(state) {
      state.displaySettings.theme =
        state.displaySettings.theme === "dark" ? "light" : "dark";
    },
    SET_NOTIFICATIONS(state, value) {
      state.displaySettings.notifications = value;
    },
    // Add mutations for other preferences as needed
  },
  actions: {
    getFavoriteChampions({ commit }) {
      const champions = retrieveFromLocalStorage("favoriteChampions") || [];
      commit("SET_FAVORITE_CHAMPIONS", champions);
    },
    updateFavoriteChampions({ commit }, champions) {
      commit("SET_FAVORITE_CHAMPIONS", champions);
      saveToLocalStorage("favoriteChampions", champions);
    },
    toggleTheme({ commit }) {
      commit("TOGGLE_THEME");
      // Persist theme preference as needed
    },
    setNotifications({ commit }, value) {
      commit("SET_NOTIFICATIONS", value);
      // Persist notification settings as needed
    },
    // Add actions for other preferences as needed
  },
  getters: {
    favoriteChampions: (state) => state.favoriteChampions,
    theme: (state) => state.displaySettings.theme,
    notifications: (state) => state.displaySettings.notifications,
    // Add getters for other preferences as needed
  },
};