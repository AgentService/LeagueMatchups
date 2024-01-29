import axios from 'axios';
const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

export const matches = {
  namespaced: true,
  state: () => ({
    lastMatch: null,
	lastThirtyGames: [],
  }),
  getters: {
    getLastMatch: (state) => state.lastMatch,
  },
  mutations: {
    SET_LAST_MATCH(state, match) {
      state.lastMatch = match;
    },
	SET_LAST_THIRTY_GAMES(state, games) { 
		state.lastThirtyGames = games;
	  },
  },
  // In deinem Vuex-Store-Modul (z.B. matches.js)
actions: {
	async fetchLastMatch({ commit, rootGetters }) {
	  const puuid = rootGetters['summoner/summonerData'].puuid;
	  const count = 5; // Anzahl der abzurufenden Spiele ändern auf 5

	  console.log('Fetching last match for PUUID:', puuid); // Überprüfe die PUUID

	  if (!puuid) {
		console.error('PUUID is missing');
		return;
	  }
  
	  try {
        const response = await axios.get(`${baseUrl}/api/matches/last-match/${puuid}`);
		console.log('Response:', response.data); // Überprüfe die Server-Antwort

		commit('SET_LAST_MATCH', response.data);
	  } catch (error) {
		console.error('Error fetching the last match:', error);
	  }
	},
  },
  
};

export default matches;
