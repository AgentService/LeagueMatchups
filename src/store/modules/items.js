// items.js
export const items = {
  namespaced: true,
  state: () => ({
    items: {},
  }),
  getters: {
    getItemDescription: (state) => (id) => {
      return state.items[id]?.description || "Description not found";
    },
    getItemById: (state) => (id) => {
      return state.items[id] || null;
    },
  },
  mutations: {
    SET_ALL_ITEMS(state, items) {
      state.items = items;
    },
  },
  actions: {
    async fetchAllItems({ dispatch, commit }) {
      const championsData = await dispatch(
        "fetchDataAndCache",
        {
          module: "items",
          type: "items",
          apiEndpoint: "/api/items/all",
          vuexMutation: "SET_ALL_ITEMS",
          commit,
        },
        { root: true }
      );

      return championsData;
    }
  },
};

export default items;
