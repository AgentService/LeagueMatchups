// matchup/MatchupNotes.vue

<template>
    <textarea v-model="notes"></textarea>
  </template>
  
  <script>
  import { computed } from 'vue';
  import { useStore } from 'vuex';

  export default {
    setup() {
      const store = useStore();
      const currentMatchup = computed(() => store.getters.currentMatchup);

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
      selectedMatchup(newMatchup) {
        this.notes = newMatchup.notes;
      },
      notes(newNotes) {
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
          this.$store.dispatch('saveNotes', { matchupId: this.currentMatchup.id, notes: newNotes });
        }, 1000); // Auto-save one second after the user stops typing
      },
    },
    computed: {
      selectedMatchup() {
        return this.$store.state.selectedMatchup;
      },
    },
  }
  </script>
  