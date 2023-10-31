<template>
  <div>
    <div>
    <h2>Matchups</h2>
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
  </div>
</div>
</template>

<script>
import { computed, ref } from 'vue'; 
import { useStore } from 'vuex';
import { mapActions } from 'vuex';
import axios from 'axios';

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
        await axios.delete('http://localhost:3001/api/matchups/delete');
        // Optionally, you can also clear the client-side state here if needed
        this.$store.commit('CLEAR_MATCHUPS'); // Assuming you have a mutation to clear matchups
      } catch (error) {
        console.error('An error occurred while deleting matchups:', error);
      }
    },
    saveNotes() {
    this.$store.dispatch('saveNotes', { matchupId: this.matchupId, notes: this.notes });
  }
  },
  
  mounted() {
    const store = useStore();
    store.dispatch('fetchMatchups'); // Fetching matchups when the component is mounted
  },
  created() {
    this.$store.dispatch('fetchChampions');

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
