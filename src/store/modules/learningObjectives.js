// store/modules/learningObjectives.js
import { reactive } from 'vue';

const predefinedObjectives = {
  "In-Game": [
    { name: "Skillshot Accuracy", gamesApplied: 0, reflections: [] },
    { name: "Wave Management", gamesApplied: 0, reflections: [] },
    { name: "Positioning", gamesApplied: 0, reflections: [] }
  ],
  "Out-of-Game": [
    { name: "Review Replays", gamesApplied: 0, reflections: [] },
    { name: "Mental Resilience", gamesApplied: 0, reflections: [] },
    { name: "Teamfight Analysis", gamesApplied: 0, reflections: [] }
  ]
};

export const learningObjectives = {
  namespaced: true,
  state: () => ({
    activeObjectives: {
      "In-Game": [],
      "Out-of-Game": []
    },
    predefinedObjectives: predefinedObjectives
  }),
  getters: {
    getActiveObjectives: (state) => (category) => state.activeObjectives[category],
    getPredefinedObjectives: (state) => (category) => state.predefinedObjectives[category],
  },
  mutations: {
    ADD_ACTIVE_OBJECTIVE(state, { lo, category }) {
      if (state.activeObjectives[category].length < 2) {
        state.activeObjectives[category].push({ ...lo, gamesApplied: 0, reflections: [] });
      }
    },
    REMOVE_ACTIVE_OBJECTIVE(state, { loName, category }) {
      state.activeObjectives[category] = state.activeObjectives[category].filter(
        (lo) => lo.name !== loName
      );
    },
    ADD_REFLECTION(state, { loName, category, reflection }) {
      const loCategory = state.activeObjectives[category] || []; // Safe check
      const lo = loCategory.find((lo) => lo.name === loName);
      if (lo) {
        lo.reflections.push(reflection);
      }
    },
    REMOVE_REFLECTION(state, { loName, category, reflectionIndex }) {
      const loCategory = state.activeObjectives[category] || []; // Safe check
      const lo = loCategory.find((lo) => lo.name === loName);
      if (lo) {
        lo.reflections.splice(reflectionIndex, 1);
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
    addReflection({ commit }, { loName, category, reflection }) {
      commit('ADD_REFLECTION', { loName, category, reflection });
    },
    removeReflection({ commit }, { loName, category, reflectionIndex }) {
      commit('REMOVE_REFLECTION', { loName, category, reflectionIndex });
    },
    incrementGamesApplied({ commit }, { loName, category }) {
      commit('INCREMENT_GAMES_APPLIED', { loName, category });
    },
  }
};
