// store/modules/notes.js
import Debug from "debug";
import axios from "axios";
const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";
import { getAuthConfig } from "./utilities.js";
const debug = Debug("app:store:notes");

export const notes = {
  namespaced: true,
  state: {
    championNotes: {},
    generalNotes: {
      "2024-01-20": "This is a test note for January 20, 2024.",
      "2024-01-19": "This is a test note for January 19, 2024.",
    },
    matchupNotes: {},
  },
  mutations: {
    // generalNotes
    SET_GENERAL_NOTE(state, { date, note }) {
      state.generalNotes[date] = note;
    },
    SET_GENERAL_NOTES(state, notes) {
      state.generalNotes = notes;
    },
    DELETE_GENERAL_NOTE(state, date) {
      delete state.generalNotes[date];
    },
    // championNotes
    SET_CHAMPION_PERSONAL_NOTES(state, { championId, data }) {
      if (!state.championNotes[championId]) {
        state.championNotes[championId] = {};
      }
      if (data.personalNotes !== undefined) {
        state.championNotes[championId].personalNotes = data.personalNotes;
      }
    },
    UPDATE_CHAMPION_PERSONAL_NOTES(state, { championId, personalNotes }) {
      if (!state.championNotes[championId]) {
        state.championNotes[championId] = {};
      }
      state.championNotes[championId].personalNotes = personalNotes;
    },
    // Matchup Notes Mutations
    SET_MATCHUP_NOTES(state, { matchupId, notes }) {
      state.matchupNotes[matchupId] = notes;
    },
    UPDATE_MATCHUP_PERSONAL_NOTES(state, { matchupId, notes }) {
      if (!state.matchupNotes[matchupId]) {
        state.matchupNotes[matchupId] = {
          notes,
        };
      } else {
        state.matchupNotes[matchupId].notes = notes;
      }
    },
  },
  getters: {
    getGeneralNote: (state) => (date) => {
      return state.generalNotes[date] || "";
    },
    getChampionNotes: (state) => (championId) => {
      return state.championNotes[championId] || {};
    },
    getChampionPersonalNotes: (state) => (championId) => {
      return state.championNotes[championId]?.personalNotes || "";
    },
    // matchup
    getMatchupNotes: (state) => (matchupId) => {
      return state.matchupNotes[matchupId] || {};
    },
    getPersonalNotesByMatchupId: (state) => (matchupId) => {
      return state.matchupNotes[matchupId]?.notes || "";
    },
  },
  actions: {
    // generalNotes
    async saveGeneralNote({ commit }, { date, note }) {
      try {
        const authConfig = getAuthConfig();
        const response = await axios.post(
          `${baseUrl}/api/generalNotes/save`,
          { date, note },
          authConfig
        );

        // Use the response data to update the state, if needed
        commit("SET_GENERAL_NOTE", { date, note: response.data.note });
      } catch (error) {
        console.error("Error saving the note:", error);
        // Handle the error appropriately
      }
    },
    async deleteGeneralNote({ commit }, date) {
      try {
        const authConfig = getAuthConfig();
        const response = await axios.delete(
          `${baseUrl}/api/generalNotes/delete/${date}`,
          authConfig
        );

        // Assuming the backend sends a success response
        if (response.status === 200) {
          commit("DELETE_GENERAL_NOTE", date);
        }
      } catch (error) {
        console.error("Error deleting the note:", error);
        // Handle the error appropriately
      }
    },
    async fetchGeneralNotes({ commit }) {
      try {
        const authConfig = getAuthConfig();
        const response = await axios.get(
          `${baseUrl}/api/generalNotes/notes`,
          authConfig
        );

        if (response.status === 200) {
          commit("SET_GENERAL_NOTES", response.data.notes);
        }
      } catch (error) {
        console.error("Error fetching notes:", error);
        // Handle the error appropriately
      }
    },
    // championNotes
    async fetchChampionPersonalNotes({ commit }, championId) {
      try {
        const authConfig = getAuthConfig();
        const response = await axios.get(
          `${baseUrl}/api/champions/${championId}/custom-data`,
          authConfig
        );
        commit("SET_CHAMPION_PERSONAL_NOTES", {
          championId,
          data: response.data.data,
        });
      } catch (error) {
        console.error("Error fetching custom champion data:", error);
        // Handle error appropriately
      }
    },
    async updateChampionPersonalNotes(
      { commit },
      { championId, personalNotes }
    ) {
      try {
        const authConfig = getAuthConfig();
        const response = await axios.post(
          `${baseUrl}/api/champions/${championId}/custom-data/notes`,
          { personalNotes }, // Assuming your backend expects an object with personalNotes
          authConfig
        );
        // Assuming the backend responds with the updated notes structure
        commit("UPDATE_CHAMPION_PERSONAL_NOTES", {
          championId,
          personalNotes: response.data.data.personalNotes,
        });
      } catch (error) {
        console.error("Error updating custom champion data:", error);
        // Handle error appropriately
      }
    },
    // Matchup Notes Actions
    async fetchMatchupNotes({ state, commit }, id) {
      if (!state.matchupNotes[id]) {
        try {
          const config = getAuthConfig(); // Ensure this function is defined and correctly sets up authorization headers
          const response = await axios.get(
            `${baseUrl}/api/notes/matchup/${id}`,
            config
          );

          commit("SET_MATCHUP_NOTES", { matchupId: id, notes: response.data });
        } catch (error) {
          console.error("Error fetching matchup notes:", error);
        }
      }
    },
    async saveOrUpdateMatchupNotes(
      { state, commit, dispatch },
      { matchupId, notes }
    ) {
      if (!state.matchupNotes[matchupId]) {
        await dispatch("fetchMatchupNotes", matchupId);
      }

      try {
        const authConfig = getAuthConfig();
        const response = await axios.post(
          `${baseUrl}/api/notes/matchup/${matchupId}`,
          { notes },
          authConfig
        );

        commit("UPDATE_MATCHUP_PERSONAL_NOTES", {
          matchupId,
          notes: response.data.note,
        });
      } catch (error) {
        console.error("Error updating matchup notes:", error);
      }
    },
  },
};

export default notes;
