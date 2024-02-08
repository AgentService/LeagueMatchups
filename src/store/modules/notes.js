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
    generalNotes: [],
    matchupNotes: {},
  },
  mutations: {
    SET_GENERAL_NOTE(state, { note }) {
      // Find the index of the note if it already exists in the state
      const index = state.generalNotes.findIndex(
        (existingNote) => existingNote.noteid === note.noteid
      );

      if (index !== -1) {
        // If the note exists, update the content of the existing note
        state.generalNotes[index] = { ...state.generalNotes[index], ...note };
      } else {
        // If the note does not exist, add the new note to the state
        state.generalNotes.push(note);
      }
    },

    SET_GENERAL_NOTES(state, notes) {
      state.generalNotes = notes;
    },
    DELETE_GENERAL_NOTE(state, noteid) {
      const index = state.generalNotes.findIndex(
        (existingNote) => existingNote.noteid === noteid
      );
      if (index !== -1) {
        state.generalNotes.splice(index, 1);
      }
    },

    // championNotes
    SET_CHAMPION_PERSONAL_NOTES(state, { championName, data }) {
      state.championNotes[championName] = data;
    },

    UPDATE_CHAMPION_PERSONAL_NOTES_CONTENT(
      state,
      { championName, content, updated_at }
    ) {
      if (state.championNotes[championName]) {
        state.championNotes[championName].content = content;
        state.championNotes[championName].updated_at = updated_at;
      }
    },

    // Matchup Notes Mutations
    SET_MATCHUP_NOTES(state, { matchupId, data }) {
      state.matchupNotes[matchupId] = data;
    },
    UPDATE_MATCHUP_PERSONAL_NOTES(state, { matchupId, content, updated_at }) {
      if (state.matchupNotes[matchupId]) {
        state.matchupNotes[matchupId].content = content;
        state.matchupNotes[matchupId].updated_at = updated_at;
      }
    },
  },
  getters: {
    getGeneralNote: (state) => (noteId) => {
      return state.generalNotes[noteId] || "";
    },
    getChampionNotes: (state) => (championId) => {
      return state.championNotes[championId] || {};
    },
    getChampionPersonalNotes: (state) => (championId) => {
      return state.championNotes[championId]?.content || "";
    },
    // matchup
    getMatchupNotes: (state) => (matchupId) => {
      return state.matchupNotes[matchupId] || {};
    },
    getPersonalNotesByMatchupId: (state) => (matchupId) => {
      return state.matchupNotes[matchupId]?.content || "";
    },
  },
  actions: {
    // generalNotes
    async saveGeneralNote({ commit }, { noteid, content }) {
      try {
        const authConfig = getAuthConfig();
        const response = await axios.post(
          `${baseUrl}/api/notes/general`,
          { noteid, content },
          authConfig
        );

        // Assuming the response data includes the entire note object
        const { note } = response.data;

        // Use the response data to update the state
        commit("SET_GENERAL_NOTE", {
          note,
        });
      } catch (error) {
        console.error("Error saving the note:", error);
        // Handle the error appropriately
      }
    },

    async deleteGeneralNote({ commit }, noteid) {
      try {
        const authConfig = getAuthConfig();
        const response = await axios.delete(
          `${baseUrl}/api/notes/general/${noteid}`,
          authConfig
        );

        // Assuming the backend sends a success response
        if (response.status === 200) {
          commit("DELETE_GENERAL_NOTE", noteid);
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
          `${baseUrl}/api/notes/general`,
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
    async fetchChampionPersonalNotes({ commit, state }, championName) {
      if (!state.championNotes[championName]) {
        try {
          const authConfig = getAuthConfig();
          const response = await axios.get(
            `${baseUrl}/api/notes/champion/${championName}`,
            authConfig
          );
          // Handle the full SQL row
          commit("SET_CHAMPION_PERSONAL_NOTES", {
            championName,
            data: response.data, // Assuming the response wraps the note in a `note` object
          });
        } catch (error) {
          console.error("Error fetching champion notes:", error);
          // Handle error appropriately
        }
      }
    },

    async updateChampionPersonalNotes({ commit }, { championName, content }) {
      try {
        const authConfig = getAuthConfig();
        const response = await axios.post(
          `${baseUrl}/api/notes/champion/${championName}`,
          { content },
          authConfig
        );
        // Only update the content in the state
        commit("UPDATE_CHAMPION_PERSONAL_NOTES_CONTENT", {
          championName,
          content: response.data.content,
          updated_at: response.data.updated_at,
        });
      } catch (error) {
        console.error("Error updating champion notes:", error);
        // Handle error appropriately
      }
    },

    // Matchup Notes Actions
    async fetchMatchupNotes({ state, commit }, id) {
      if (!state.matchupNotes[id]) {
        try {
          const authConfig = getAuthConfig(); // Ensure this function is defined and correctly sets up authorization headers
          const response = await axios.get(
            `${baseUrl}/api/notes/matchup/${id}`,
            authConfig
          );

          commit("SET_MATCHUP_NOTES", { matchupId: id, data: response.data });
        } catch (error) {
          console.error("Error fetching matchup notes:", error);
        }
      }
    },
    async saveOrUpdateMatchupNotes(
      { state, commit, dispatch },
      { matchupId, content }
    ) {
      if (!state.matchupNotes[matchupId]) {
        await dispatch("fetchMatchupNotes", matchupId);
      }

      try {
        const authConfig = getAuthConfig();
        const response = await axios.post(
          `${baseUrl}/api/notes/matchup/${matchupId}`,
          { content },
          authConfig
        );

        commit("UPDATE_MATCHUP_PERSONAL_NOTES", {
          matchupId,
          content: response.data.content,
          updated_at: response.data.updated_at,
        });
      } catch (error) {
        console.error("Error updating matchup notes:", error);
      }
    },
  },
};

export default notes;