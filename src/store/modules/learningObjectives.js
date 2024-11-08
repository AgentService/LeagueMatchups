// store/modules/learningObjectives.js
import dayjs from 'dayjs'; // Import dayjs
const predefinedObjectives = {
  "In-Game": [
    {
      name: "Skillshot Accuracy",
      gamesApplied: 0,
      reflections: [
        { loName: "Skillshot Accuracy", category: "In-Game", text: "Noticed a significant improvement in landing skillshots during the last three matches. Practicing in the training mode really paid off.", timestamp: "2024-11-01 12:30" },
        { loName: "Skillshot Accuracy", category: "In-Game", text: "Missed a crucial skillshot in the recent game which led to a disadvantage. Need to focus more on aiming under pressure.", timestamp: "2024-11-02 15:45" },
        { loName: "Skillshot Accuracy", category: "In-Game", text: "Consistently hitting skillshots has boosted my confidence and overall performance in team fights.", timestamp: "2024-11-03 18:00" }
      ]
    },
    {
      name: "Wave Management",
      gamesApplied: 0,
      reflections: [
        { loName: "Wave Management", category: "In-Game", text: "Successfully froze the wave near my turret, making it harder for the opponent to farm safely.", timestamp: "2024-11-01 10:20" },
        { loName: "Wave Management", category: "In-Game", text: "Struggled with pushing the wave at the right times, leading to multiple deaths in the lane.", timestamp: "2024-11-02 12:30" },
        { loName: "Wave Management", category: "In-Game", text: "Managed to reset the wave after recalling, ensuring a balanced minion wave upon return.", timestamp: "2024-11-03 16:15" }
      ]
    },
    // ... other objectives
  ],
  "Out-of-Game": [
    {
      name: "Review Replays",
      gamesApplied: 0,
      reflections: [
        { loName: "Review Replays", category: "Out-of-Game", text: "Analyzed my last five games and identified recurring mistakes in decision-making during late game.", timestamp: "2024-11-01 11:00" },
        { loName: "Review Replays", category: "Out-of-Game", text: "Noticed that I often miss opportunities to ward key areas, which affects map control.", timestamp: "2024-11-02 13:45" },
        { loName: "Review Replays", category: "Out-of-Game", text: "Replays helped me understand the importance of objective prioritization over solo kills.", timestamp: "2024-11-03 15:30" }
      ]
    },
    // ... other objectives
  ]
};



const defaultState = () => ({
  activeObjectives: {
    "In-Game": [],
    "Out-of-Game": []
  },
  predefinedObjectives: predefinedObjectives
});

export const learningObjectives = {
  namespaced: true,
  state: defaultState(),
  getters: {
    getActiveObjectivesByCategory: (state) => (category) => state.activeObjectives[category],
    getAllActiveObjectives: (state) => state.activeObjectives,
    getPredefinedObjectives: (state) => (category) => state.predefinedObjectives[category],
    getAllPredefinedObjectives: (state) => state.predefinedObjectives,
  },

  mutations: {
    RESET_STATE(state) {
      Object.assign(state, defaultState());
    },
    ADD_PREDEFINED_OBJECTIVE(state, { lo, category }) {
      const exists = state.predefinedObjectives[category].some(
        (existingLO) => existingLO.name.toLowerCase() === lo.name.toLowerCase()
      );
      if (!exists) {
        state.predefinedObjectives[category].push(lo);
      }
    },
    DELETE_PREDEFINED_OBJECTIVE(state, { loName, category }) {
      state.predefinedObjectives[category] = state.predefinedObjectives[category].filter(lo => lo.name !== loName);
    },
    ADD_ACTIVE_OBJECTIVE(state, { lo, category }) {
      // Prevent adding duplicates even if called incorrectly
      const exists = state.activeObjectives[category].some(activeLO => activeLO.name === lo.name);
      if (!exists) {
        state.activeObjectives[category].push(lo);
      }
    },
    REMOVE_ACTIVE_OBJECTIVE(state, { loName, category }) {
      state.activeObjectives[category] = state.activeObjectives[category].filter(
        (lo) => lo.name !== loName
      );
    },
    ADD_REFLECTION(state, { loName, category, reflection }) {
      const loCategory = state.predefinedObjectives[category] || []; // Safe check
      const lo = loCategory.find((lo) => lo.name === loName);
      if (lo) {
        lo.reflections.unshift(reflection); // Adds the reflection to the start of the list
      }
    },
    REMOVE_REFLECTION(state, { loName, category, index }) { // Changed from reflectionIndex to index
      const loCategory = state.predefinedObjectives[category] || []; // Safe check
      const lo = loCategory.find((lo) => lo.name === loName);
      if (lo && lo.reflections) {
        lo.reflections.splice(index, 1);
      }
    },
    INCREMENT_GAMES_APPLIED(state, { loName, category }) {
      const lo = state.activeObjectives[category].find((lo) => lo.name === loName);
      if (lo) {
        lo.gamesApplied += 1;
      }
    },
  },
  actions: {
    addPredefinedObjective({ commit }, payload) {
      commit('ADD_PREDEFINED_OBJECTIVE', payload);
    },
    deletePredefinedObjective({ commit }, payload) {
      commit('DELETE_PREDEFINED_OBJECTIVE', payload);
    },
    addActiveObjective({ commit, state }, { lo, category }) {
      const existingLO = state.activeObjectives[category].find(
        (activeLO) => activeLO.name === lo.name
      );
      if (!existingLO && state.activeObjectives[category].length < 2) {
        commit('ADD_ACTIVE_OBJECTIVE', { lo, category });
      }
    },
    removeActiveObjective({ commit }, { loName, category }) {
      commit('REMOVE_ACTIVE_OBJECTIVE', { loName, category });
    },
    addReflection({ commit }, { loName, category, text }) { // Changed payload to include 'text'
      const reflection = {
        text,
        timestamp: dayjs().format('YYYY-MM-DD HH:mm'), // Add timestamp using dayjs
      };
      commit('ADD_REFLECTION', { loName, category, reflection });
    },
    removeReflection({ commit }, { loName, category, index }) { // Changed to accept 'index'
      commit('REMOVE_REFLECTION', { loName, category, index });
    },
    incrementGamesApplied({ commit }, { loName, category }) {
      commit('INCREMENT_GAMES_APPLIED', { loName, category });
    },
  }
};
