// metrics.js

export const metrics = {
  namespaced: true,
  state: () => ({
    subjectiveFeedbacks: {}, // Store subjective feedbacks by gameId
    objectiveMetrics: {},    // Store objective metrics by gameId (future use)
  }),
  getters: {
    // Get subjective feedback for a specific game
    getSubjectiveFeedbackByGameId: (state) => (gameId) => {
      return state.subjectiveFeedbacks[gameId] || null;
    },
    // Get all subjective feedbacks (e.g., for analysis)
    getAllSubjectiveFeedbacks(state) {
      return Object.values(state.subjectiveFeedbacks);
    },
    // Placeholder for getting objective metrics (future)
    getObjectiveMetricsByGameId: (state) => (gameId) => {
      return state.objectiveMetrics[gameId] || {};
    },
  },
  mutations: {
    // Save or update subjective feedback for a game
    ADD_OR_UPDATE_SUBJECTIVE_FEEDBACK(state, feedbackEntry) {
      state.subjectiveFeedbacks[feedbackEntry.gameId] = feedbackEntry;
    },
    // Placeholder for saving or updating objective metrics (future)
    ADD_OR_UPDATE_OBJECTIVE_METRICS(state, { gameId, metrics }) {
      state.objectiveMetrics[gameId] = metrics;
    },
  },
  actions: {
    // Action to add or update subjective feedback
    addOrUpdateSubjectiveFeedback({ commit }, feedbackEntry) {
      commit("ADD_OR_UPDATE_SUBJECTIVE_FEEDBACK", feedbackEntry);
    },
    // Placeholder action for adding or updating objective metrics (future)
    addOrUpdateObjectiveMetrics({ commit }, { gameId, metrics }) {
      commit("ADD_OR_UPDATE_OBJECTIVE_METRICS", { gameId, metrics });
    },
  },
};

export default metrics;
