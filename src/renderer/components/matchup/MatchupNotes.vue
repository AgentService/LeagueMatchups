// matchup/MatchupNotes.vue
<template>

    <div class="notes-section h-50 card p-3 mb-3 form-floating">
      <textarea v-model="notes" id="floatingTextarea" placeholder="Notes" class="form-control" rows="2" style="resize: none;"></textarea>
      <label for="floatingTextarea">Notes</label>
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

<style  scoped>



.notes-section {
  width: 50%;
  background: linear-gradient(to bottom, #0AC8B9, #005A82);
  padding: 2rem;

}

.notes-section textarea {
  height: 100%;
  width: 100%;
  color:  var(--blue-1);
  border-radius:5px;
  background: linear-gradient(to bottom, #091428, #0A1428);

  margin: 0 auto; /* Center the textarea */
}
</style>
  