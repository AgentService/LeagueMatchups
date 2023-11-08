<template>
  <div>
    <div>
      <button @click="executeMainFunction">Download Champion Images</button>

      <button @click="deleteMatchups">Delete Matchups</button>
      <ul>
        <li v-for="(matchup, index) in matchups" :key="index">
          <template v-if="matchup.champions && matchup.champions.length >= 2">
            {{ matchup.champions[0].name }} vs {{ matchup.champions[1].name }}
          </template>
          <template v-else>
            Invalid matchup data
          </template>
        </li>
      </ul>
    </div>
    <div>
      <MatchupNotes></MatchupNotes>
    </div>
  </div>
</template>

<script>
import { computed } from "vue";
import { useStore } from "vuex";
import axios from "axios";

import Debug from "debug";
const debug = Debug("app:component:ChampionMatchup");

const baseUrl = import.meta.env.VITE_API_BASE_URL;
// import { main } from "../../../download.mjs";

export default {
	setup() {
		const store = useStore();
		const currentMatchup = computed(() => store.getters.currentMatchup);
		const matchups = computed(() => store.state.matchups);
		return {
			matchups,
			currentMatchup,
		};
	},

	methods: {
		async deleteMatchups() {
			try {
				debug("Deleting matchups...");
				await axios.delete(`${baseUrl}/api/matchups/delete`);
				// Optionally, you can also clear the client-side state here if needed
				debug("Matchups deleted successfully.");
				this.$store.commit("CLEAR_MATCHUPS"); // Assuming you have a mutation to clear matchups
			} catch (error) {
				console.error("An error occurred while deleting matchups:", error);
			}
		},
		saveNotes() {
			debug("Saving notes...");
			this.$store.dispatch("saveNotes", { matchupId: this.matchupId, notes: this.notes });
		}
	},
	computed: {
		champions() {
			return this.$store.state.champions;
		}
	}
};
</script>

<style scoped>
.matchup-display {
  background-color: var(--secondary-color);
  background-color: salmon;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
