const defaultState = () => ({
  favoriteChampions: [],
  displaySettings: {
    theme: "dark", // Default theme
    notifications: true, // Enable notifications by default
  },
  // Add other user preferences here
});

// src/store/userPreferences.js
export const userPreferences = {
  namespaced: true,
  state: defaultState(),
  mutations: {
    RESET_STATE(state) {
      Object.assign(state, defaultState());
    },
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
    updateFavoriteChampions({ commit }, champions) {
      commit("SET_FAVORITE_CHAMPIONS", champions);
    },
    toggleTheme({ commit }) {
      commit("TOGGLE_THEME");
    },
    setNotifications({ commit }, value) {
      commit("SET_NOTIFICATIONS", value);
    },
  },
  getters: {
    favoriteChampions: (state) => state.favoriteChampions,
    theme: (state) => state.displaySettings.theme,
    notifications: (state) => state.displaySettings.notifications,
    // Add getters for other preferences as needed
  },
};