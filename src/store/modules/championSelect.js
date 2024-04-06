// // store/modules/championSelect.js
// export const championSelect = {
//   namespaced: true,
//   state: () => ({
//     phase: "",
//     selectedChampion: null, // Champion currently being selected but not yet confirmed
//     pickedChampion: null, // The champion that has been confirmed as picked
//     session: null,
//   }),
//   mutations: {
//     setPhase(state, phase) {
//       state.phase = phase;
//     },
//     setSelectedChampion(state, champion) {
//       state.selectedChampion = champion;
//     },
//     setSession(state, session) {
//       state.session = session;
//     },
//     setPickedChampion(state, champion) {
//       state.pickedChampion = champion;
//     },
//   },
//   actions: {
//     async updatePhase({ commit }, phase) {
//       commit("setPhase", phase);
//     },
//     async selectChampion({ commit }, championId) {
//       const champion = await fetchChampionById(championId);
//       commit("setSelectedChampion", champion);
//     },
//     async sessionUpdate({ commit }, session) {
//       commit("setSession", session);
//     },
//     async pickChampion({ commit }, championId) {
//       const champion = await fetchChampionById(championId);
//       commit("setPickedChampion", champion);
//     },
//   },
// };

// async function fetchChampionById(championId) {
//   return async (key) => {
//     const championList = computed(
//       () => this.$store.getters["champions/getChampionDetails"]
//     );
//     const champions = championList.value
//       ? Object.values(championList.value)
//       : [];
//     return champions.find(
//       (champion) => champion.key === String(key.toString())
//     );
//   };
// }
