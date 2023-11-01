// matchup/MatchupNotes.vue

<template>
    <div class="notes-section">
        <h3>Matchup Notes</h3>
        <textarea v-model="notes"></textarea>
    </div>
</template>
  
  <script>
  import { computed } from 'vue';
  import { useStore } from 'vuex';

  export default {
    setup() {
      const store = useStore();
      const currentMatchup = computed(() => store.getters.getCurrentMatchup);
      return {
        currentMatchup,
      };
    },
    data() {
      return {
        notes: '',
        timeout: null,
      };
    },
    watch: {
    notes(newNotes) {
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
            console.log("Saving notes:", newNotes);
        this.$store.dispatch('saveNotes', { matchupId: this.currentMatchup.id, notes: newNotes });
        }, 1000);
    },
    currentMatchup(newMatchup, oldMatchup) {
        console.log("currentMatchup changed:", newMatchup, oldMatchup);

    if (newMatchup !== oldMatchup) {
      this.notes = newMatchup.notes;
    }}
    },
    mounted() {
    if (this.currentMatchup) {
      this.notes = this.currentMatchup.notes;
    }
    },
  }
  </script>

<style scoped>



.notes-section {
  margin-bottom: 20px;
}

.notes-section textarea {
  width: 100%;
  height: 100px;
}
</style>
  