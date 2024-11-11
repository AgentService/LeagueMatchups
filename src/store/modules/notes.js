// store/modules/notes.js
import Debug from "debug";
import axios from "axios";
const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";
import { getAuthConfig } from "./utilities.js";
const debug = Debug("app:store:notes");

const defaultState = () => ({
  championNotes: {},
  championNotesShared: {},
  generalNotes: [],
  matchupNotes: {},
  matchupNotesShared: {},
  rating: {
    champion: {},
    matchup: {},
  },
  lastFetchTimestamps: {
    champions: {},
    matchups: {},
    tags: null,
  },
  tagsList: [],
});


export const notes = {
  namespaced: true,
  state: defaultState(),
  mutations: {
    RESET_STATE(state) {
      Object.assign(state, defaultState());
    },
    // generalNotes
    ADD_GENERAL_NOTE(state, note) {
      state.generalNotes.push(note);
    },
    UPDATE_GENERAL_NOTE: (state, note) => {
      const index = state.generalNotes.findIndex(
        (existingNote) => existingNote.noteId === note.noteId
      );
      if (index !== -1) {
        // If the note exists, update the content of the existing note
        state.generalNotes[index] = { ...state.generalNotes[index], ...note };
      }
    },
    SET_GENERAL_NOTES(state, notes) {
      state.generalNotes = notes;
    },
    DELETE_GENERAL_NOTE(state, noteId) {
      const index = state.generalNotes.findIndex(
        (existingNote) => existingNote.noteId === noteId
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
      { championName, content, updatedAt }
    ) {
      if (state.championNotes[championName]) {
        state.championNotes[championName].content = content;
        state.championNotes[championName].updatedAt = updatedAt;
      }
    },
    SET_OTHER_USERS_CHAMPION_NOTES(state, { championName, notes }) {
      state.championNotesShared[championName] = notes;
    },
    // Matchup Notes Mutations
    SET_MATCHUP_NOTES(state, { matchupId, data }) {
      state.matchupNotes[matchupId] = data;
    },
    UPDATE_MATCHUP_PERSONAL_NOTES(state, { matchupId, content, updatedAt }) {
      if (state.matchupNotes[matchupId]) {
        state.matchupNotes[matchupId].content = content;
        state.matchupNotes[matchupId].updatedAt = updatedAt;
      }
    },
    SET_OTHER_USERS_MATCHUP_NOTES(state, { combinedId, notes }) {
      state.matchupNotesShared[combinedId] = notes;
    },
    // TIMESTAMP MUTATIONS
    SET_LAST_FETCH_TIMESTAMP(state, { type, key, timestamp }) {
      if (type === "tags") {
        state.lastFetchTimestamps.tags = timestamp; // Store the timestamp directly as a number
      } else {
        if (!state.lastFetchTimestamps[type]) {
          state.lastFetchTimestamps[type] = {};
        }
        state.lastFetchTimestamps[type][key] = timestamp;
      }
    },
    // Rating Mutations
    SET_CHAMPION_NOTES_RATING(state, { championName, noteId, rating }) {
      // Check if the champion's notes exist in the shared structure
      if (state.championNotesShared[championName]) {
        // Find the note by noteId
        const noteIndex = state.championNotesShared[championName].findIndex(
          (note) => note.noteId === noteId
        );

        // If found, update the rating and isFavorite status
        if (noteIndex !== -1) {
          state.championNotesShared[championName][noteIndex].personalRating =
            rating;
        }
      }
    },
    SET_MATCHUP_NOTES_RATING(state, { matchupId, noteId, rating }) {
      // Check if the champion's notes exist in the shared structure
      if (state.matchupNotesShared[matchupId]) {
        // Find the note by noteId
        const noteIndex = state.matchupNotesShared[matchupId].findIndex(
          (note) => note.noteId === noteId
        );

        // If found, update the rating and isFavorite status
        if (noteIndex !== -1) {
          state.matchupNotesShared[matchupId][noteIndex].personalRating =
            rating;
        }
      }
    },
    // Tags Mutations
    SET_NOTES(state, notes) {
      state.notesList = notes;
    },
    SET_TAGS(state, tags) {
      state.tagsList = tags;
    },
    ADD_TAG_TO_NOTE(state, { noteId, tagId }) {
      const note = state.generalNotes.find((note) => note.noteId === noteId);
      if (note) {
        // Initialize the tags array if it doesn't exist
        if (!note.tags) {
          note.tags = [];
        }
        // Only add the tag if it's not already associated with the note
        if (!note.tags.includes(tagId)) {
          note.tags.push(tagId);
        }
      } else {
        // Optionally, handle the case where the note doesn't exist
        console.error(`Note with ID ${noteId} not found.`);
      }
    },

    REMOVE_TAG_FROM_NOTE(state, { noteId, tagId }) {
      const note = state.generalNotes.find((note) => note.noteId === noteId);
      if (note) {
        note.tags = note.tags.filter((t) => t !== tagId);
      }
    },
  },
  getters: {
    getGeneralNote: (state) => (noteId) => {
      return state.generalNotes[noteId] || "";
    },
    getChampionNotesShared: (state) => (championId) => {
      return state.championNotesShared[championId] || [];
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
    getMatchupNotesShared: (state) => (matchupId) => {
      return state.matchupNotesShared[matchupId] || [];
    },
    // tags getters
    getGeneralNoteById: (state) => (noteId) => {
      return state.generalNotes.find((note) => note.id === noteId);
    },
    allTags: (state) => state.tagsList,
  },
  actions: {
    // generalNotes
    async createNewNote({ commit }) {
      try {
        const content = ""; // Default content for the new note
        const authConfig = getAuthConfig();
        const response = await axios.post(
          `${baseUrl}/api/notes/general`,
          { content }, // Note: No noteId is sent for a new note
          authConfig
        );
        const { note } = response.data;
        commit("ADD_GENERAL_NOTE", note); // Assuming you have a mutation to add a note to the state
      } catch (error) {
        console.error("Error creating the note:", error);
        // Handle the error appropriately
      }
    },
    async saveGeneralNote({ commit }, { noteId, content }) {
      try {
        const authConfig = getAuthConfig();
        const response = await axios.post(
          `${baseUrl}/api/notes/general`,
          { noteId, content },
          authConfig
        );
        const { note } = response.data;
        commit("UPDATE_GENERAL_NOTE", note); // Assuming you have a mutation to update a note in the state
      } catch (error) {
        console.error("Error saving the note:", error);
        // Handle the error appropriately
      }
    },
    async deleteGeneralNote({ commit }, noteId) {
      try {
        const authConfig = getAuthConfig();
        const response = await axios.delete(
          `${baseUrl}/api/notes/general/${noteId}`,
          authConfig
        );

        // Assuming the backend sends a success response
        if (response.status === 200) {
          commit("DELETE_GENERAL_NOTE", noteId);
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
    async fetchOtherUsersChampionNotes({ commit, state }, championName) {
      const lastFetchTime =
        state.lastFetchTimestamps.champions[championName] || 0;

      if (
        !shouldFetchData(lastFetchTime) &&
        state.championNotesShared[championName]
      ) {
        console.log(
          "Champion notes for",
          championName,
          "are up-to-date. Using stored notes."
        );
        return;
      }
      try {
        const authConfig = getAuthConfig();
        const response = await axios.get(
          `${baseUrl}/api/notes/champion/others/${championName}`,
          authConfig
        );
        commit("SET_OTHER_USERS_CHAMPION_NOTES", {
          championName,
          notes: response.data, // Assuming the response wraps the notes in a data array
        });
        updateLastFetchTimestamp(commit, {
          type: "champions",
          key: championName,
        });
      } catch (error) {
        console.error("Error fetching other users' champion notes:", error);
        // Handle error appropriately
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
          updatedAt: response.data.updatedAt,
        });
      } catch (error) {
        console.error("Error updating champion notes:", error);
        // Handle error appropriately
      }
    },
    // Matchup Notes Actions
    async fetchMatchupNotes({ state, commit }, combinedId) {
      if (!state.matchupNotes[combinedId]) {
        try {
          const authConfig = getAuthConfig(); // Ensure this function is defined and correctly sets up authorization headers
          const response = await axios.get(
            `${baseUrl}/api/notes/matchup/${combinedId}`,
            authConfig
          );
          commit("SET_MATCHUP_NOTES", {
            matchupId: combinedId,
            data: response.data,
          });
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
          updatedAt: response.data.updatedAt,
        });
      } catch (error) {
        console.error("Error updating matchup notes:", error);
      }
    },
    async fetchOtherUsersMatchupNotes({ commit, state }, combinedId) {
      const lastFetchTime = state.lastFetchTimestamps.matchups[combinedId] || 0;

      if (
        !shouldFetchData(lastFetchTime) &&
        state.matchupNotesShared[combinedId]
      ) {
        console.log("Matchup notes are up-to-date. Using stored notes.");
        return;
      }
      try {
        const authConfig = getAuthConfig();
        const response = await axios.get(
          `${baseUrl}/api/notes/matchup/others/${combinedId}`,
          authConfig
        );

        commit("SET_OTHER_USERS_MATCHUP_NOTES", {
          combinedId,
          notes: response.data,
        });
        updateLastFetchTimestamp(commit, { type: "matchups", key: combinedId });
      } catch (error) {
        console.error("Error fetching other users' matchup notes:", error);
      }
    },

    // Rating
    async updateChampionNoteRating(
      { commit },
      { championName, noteId, rating }
    ) {
      try {
        const response = await axios.post(
          `${baseUrl}/api/notes/champion/rating`,
          { noteId, rating }
        );
        // Assuming the backend response includes the updated rating or a success message
        if (response.status === 200) {
          commit("SET_CHAMPION_NOTES_RATING", { championName, noteId, rating });
        } else {
          // Handle non-success response
          console.error("Failed to update rating");
        }
      } catch (error) {
        // Handle error, possibly revert optimistic update
        console.error("Error updating rating:", error);
      }
    },
    // New action for matchup notes
    async updateMatchupNoteRating({ commit }, { matchupId, noteId, rating }) {
      try {
        const response = await axios.post(
          `${baseUrl}/api/notes/matchup/rating`,
          { noteId, rating }
        );
        if (response.status === 200) {
          commit("SET_MATCHUP_NOTES_RATING", { matchupId, noteId, rating });
        } else {
          console.error("Failed to update matchup note rating");
        }
      } catch (error) {
        console.error("Error updating matchup note rating:", error);
      }
    },
    // Tags Actions
    async fetchTags({ commit, state }) {
      try {
        const hasValidTimestamp = typeof state.lastFetchTimestamps.tags === 'number';
        var shouldFetch = state.tagsList.length === 0 && (!state.lastFetchTimestamps.tags || hasValidTimestamp && shouldFetchData(state.lastFetchTimestamps.tags));

        if (!shouldFetch) {
          console.log("Using cached tags data.");
          return; // Exit if cached data is valid and tagsList is not empty
        }

        const authConfig = getAuthConfig();
        const response = await axios.get(`${baseUrl}/api/notes/tags`, authConfig);

        // Commit the fetched tags and update the timestamp
        commit("SET_TAGS", response.data.tags);
        updateLastFetchTimestamp(commit, { type: "tags", key: "tags" });
      } catch (error) {
        console.error("Error fetching tags:", error);
      }
    },


    async addTagToNote({ commit }, { noteId, tagId }) {
      try {
        const authConfig = getAuthConfig();

        await axios.post(
          `${baseUrl}/api/notes/general/${noteId}/tags`,
          {
            tagIds: [tagId],
          },
          authConfig
        );
        commit("ADD_TAG_TO_NOTE", { noteId, tagId });
      } catch (error) {
        console.error("Error adding tag to note:", error);
      }
    },
    async removeTagFromNote({ commit }, { noteId, tagId }) {
      try {
        const authConfig = getAuthConfig();
        await axios.delete(
          `${baseUrl}/api/notes/general/${noteId}/tags/${tagId}`, authConfig),
          commit("REMOVE_TAG_FROM_NOTE", { noteId, tagId });
      } catch (error) {
        console.error("Error removing tag from note:", error);
      }
    },
  },
};

function shouldFetchData(lastFetchTime) {
  const currentTime = Date.now();
  const hoursSinceLastFetch = (currentTime - lastFetchTime) / (1000 * 60 * 60);
  return hoursSinceLastFetch >= 24;
}
// Timestamp update helper
function updateLastFetchTimestamp(commit, { type, key }) {
  const currentTime = Date.now();
  commit("SET_LAST_FETCH_TIMESTAMP", {
    type,
    key,
    timestamp: currentTime,
  });
}

export default notes;
