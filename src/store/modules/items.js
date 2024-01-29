// items.js
import axios from "axios";

export const items = {
  namespaced: true,
  state: () => ({
    allItems: {},
  }),
  getters: {
    getItemDescription: (state) => (id) => {
      return state.allItems[id]?.description || "Description not found";
    },
    getItemById: (state) => (id) => {
      return state.allItems[id] || null;
    },
  },
  mutations: {
    SET_ALL_ITEMS(state, items) {
      state.allItems = items;
    },
  },
  actions: {
    async fetchAllItems({ commit }) {
      try {
        const response = await axios.get(
          "https://ddragon.leagueoflegends.com/cdn/14.1.1/data/en_US/item.json"
        );
        commit("SET_ALL_ITEMS", response.data.data);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    },
  },
};

export default items;
