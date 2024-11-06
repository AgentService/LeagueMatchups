// store/modules/learningObjectives.js
import dayjs from 'dayjs'; // Import dayjs

const predefinedObjectives = {
  "In-Game": [
    {
      name: "Skillshot Accuracy",
      gamesApplied: 0,
      reflections: [
        "Noticed a significant improvement in landing skillshots during the last three matches. Practicing in the training mode really paid off.",
        "Missed a crucial skillshot in the recent game which led to a disadvantage. Need to focus more on aiming under pressure.",
        "Consistently hitting skillshots has boosted my confidence and overall performance in team fights."
      ]
    },
    {
      name: "Wave Management",
      gamesApplied: 0,
      reflections: [
        "Successfully froze the wave near my turret, making it harder for the opponent to farm safely.",
        "Struggled with pushing the wave at the right times, leading to multiple deaths in the lane.",
        "Managed to reset the wave after recalling, ensuring a balanced minion wave upon return."
      ]
    },
    {
      name: "Positioning",
      gamesApplied: 0,
      reflections: [
        "Maintained optimal positioning during team fights, avoiding unnecessary engagements and staying safe.",
        "Found myself out of position multiple times, which resulted in getting caught by the enemy's crowd control.",
        "Improved positioning by staying behind the frontline, allowing me to deal damage without being targeted."
      ]
    }
  ],
  "Out-of-Game": [
    {
      name: "Review Replays",
      gamesApplied: 0,
      reflections: [
        "Analyzed my last five games and identified recurring mistakes in decision-making during late game.",
        "Noticed that I often miss opportunities to ward key areas, which affects map control.",
        "Replays helped me understand the importance of objective prioritization over solo kills."
      ]
    },
    {
      name: "Mental Resilience",
      gamesApplied: 0,
      reflections: [
        "Maintained composure after a series of losses, focusing on learning rather than getting frustrated.",
        "Faced a toxic teammate but chose to stay positive and encourage team communication.",
        "Implemented breathing exercises to stay calm during high-stress moments in matches."
      ]
    },
    {
      name: "Teamfight Analysis",
      gamesApplied: 0,
      reflections: [
        "Reviewed teamfights to understand positioning errors and timing of abilities.",
        "Identified that our team lacks proper coordination during engagements, leading to disorganized fights.",
        "Learned the importance of target prioritization by observing successful teamfights in high-level play."
      ]
    }
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
        lo.reflections.push(reflection);
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
