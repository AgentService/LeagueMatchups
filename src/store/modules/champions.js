import Debug from "debug";
const debug = Debug("app:store:champions");

// const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

export const champions = {
  namespaced: true,
  state: () => ({
    currentChampionA: null,
    selectedSpells: [], // Array to store selected summoner spells
    championList: {},
    championDetails: {}, // Initialize as an empty object
    championTips: {}, // Dieses Objekt wird nur Tipps für jeden Champion speichern
    championCustomData: {}, // Object to store notes for each champion
  }),
  getters: {
    getChampionTips: (state) => (championId) => {
      // Get tips for the requested champion if available
      const tips = state?.championTips[championId.value];
      return tips || [];
    },
    getChampionCustomData: (state) => (championId) => {
      return state.championCustomData[championId] || {};
    },
    getChampionList: (state) => {
      return state.championList;
    },
    getChampionDetails: (state) => {
      return state.championDetails;
    },
  },
  mutations: {
    SET_CHAMPION_LIST_DATA(state, listData) {
      state.championList = listData.data;
    },
    SET_ALL_CHAMPION_DETAILS(state, detailedData) {
      state.championDetails = detailedData.data;
    },
    SET_CHAMPION_TIPS(state, data) {
      const championId = data.championId;
      const tips = data.championTips;
      if (!state.championTips[championId]) {
        // Initialize the champion's tips if not already present
        state.championTips[championId] = {};
      }
      state.championTips[championId] = tips; // Assign the tips for the champion
    },
    setSelectedSpells(state, spells) {
      state.selectedSpells = spells;
    },
    SET_CUSTOM_CHAMPION_DATA(state, { championId, data }) {
      // Ensure there's an object for the champion
      if (!state.championCustomData[championId]) {
        state.championCustomData[championId] = {};
      }

      // Update the personalNotes if provided
      if (data.personalNotes !== undefined) {
        state.championCustomData[championId].personalNotes = data.personalNotes;
      }

      // Update the summonerSpells if provided
      if (data.summonerSpells !== undefined) {
        state.championCustomData[championId].summonerSpells =
          data.summonerSpells;
      }
    },
    SET_ALL_CUSTOM_CHAMPION_DATA(state, data) {
      state.championCustomData = data;
    },
  },
  actions: {
    setSelectedSpells(state, spells) {
      state.selectedSpells = spells;
    },
    async retrieveChampionData({ dispatch }) {
      const championsData = await dispatch(
        "fetchDataAndCache",
        {
          module: "champions",
          type: "championList",
          apiEndpoint: "/api/champions/list",
          vuexMutation: "champions/SET_CHAMPION_LIST_DATA",
          skipCacheValidation: false,
          isVersioned: true,
        },
        { root: true }
      );

      return championsData;
    },
    async retrieveChampionDetails({ dispatch }) {
      const championDetailedData = await dispatch(
        "fetchDataAndCache",
        {
          module: "champions",
          type: "championDetails",
          apiEndpoint: "/api/champions/details",
          vuexMutation: "champions/SET_ALL_CHAMPION_DETAILS",
          skipCacheValidation: false,
        },
        { root: true }
      );

      return championDetailedData;
    },
    async updateDataIfNeeded({ dispatch }) {
      try {
        // Use the fetchDataAndCache function for champion list data
        await dispatch(
          "fetchDataAndCache",
          {
            module: "champions",
            type: "championList",
            apiEndpoint: "/api/champions",
            vuexMutation: "champions/SET_CHAMPION_LIST_DATA",
            skipCacheValidation: false,
          },
          { root: true }
        );
        await dispatch(
          "fetchDataAndCache",
          {
            module: "champions",
            type: "championDetails",
            apiEndpoint: "/api/champions/details",
            vuexMutation: "champions/SET_ALL_CHAMPION_DETAILS",
            skipCacheValidation: false,
          },
          { root: true }
        );
      } catch (error) {
        console.error("Error updating data:", error);
        // Handle the error appropriately
      }
    },
    async fetchChampionTips({ dispatch }, { championId }) {
      const championTips = await dispatch(
        "fetchDataAndCache",
        {
          module: "champions",
          type: "championTips",
          apiEndpoint: `/api/champions/${championId}/tips`,
          vuexMutation: "champions/SET_CHAMPION_TIPS",
          skipCacheValidation: true,
          itemId: championId,
          skipCacheValidation: true,
        },
        { root: true }
      );
      if (championTips) {
        debug("Champion tips:", championTips);
      } else {
        debug("No champion tips found for:", championId);
      }
      return championTips;
    },
  },
};
