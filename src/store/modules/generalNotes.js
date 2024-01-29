// store/modules/generalNotes.js
import axios from "axios";
const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";
import { getAuthConfig } from "./utilities.js";

export const generalNotes = {
  namespaced: true,
  state: () => ({
    notesByDate: {
      "2024-01-20": "This is a test note for January 20, 2024.",
      "2024-01-19": "This is a test note for January 19, 2024.",
    },
  }),
  getters: {
    getNoteByDate: (state) => (date) => {
      return state.notesByDate[date] || "";
    },
  },
  mutations: {
    SET_NOTE(state, { date, note }) {
      state.notesByDate[date] = note;
    },
    DELETE_NOTE(state, date) {
      delete state.notesByDate[date];
    },
  },
  actions: {
    async saveNote({ commit }, { date, note }) {
      try {
        const authConfig = getAuthConfig();
        const response = await axios.post(
          `${baseUrl}/api/generalNotes/save`,
          { date, note },
          authConfig
        );

        // Use the response data to update the state, if needed
        commit("SET_NOTE", { date, note: response.data.note });
      } catch (error) {
        console.error("Error saving the note:", error);
        // Handle the error appropriately
      }
    },
    async deleteNote({ commit }, date) {
      try {
        const authConfig = getAuthConfig();
        const response = await axios.delete(
          `${baseUrl}/api/generalNotes/delete/${date}`,
          authConfig
        );

        // Assuming the backend sends a success response
        if (response.status === 200) {
          commit("DELETE_NOTE", date);
        }
      } catch (error) {
        console.error("Error deleting the note:", error);
        // Handle the error appropriately
      }
    },
  },
};

export default generalNotes;