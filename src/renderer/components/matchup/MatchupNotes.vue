// matchup/MatchupNotes.vue
<template>
    <div class="custom-container ">
      <div class="placeholder" style="background-color: #005b8281; height: 100%; width: 100%">
        <div class="card" style="width: 100%; height: 100%;">
          <div class="card-body">
            <h5 class="card-title">Custom  Notes</h5>
            <div class="notes-section ">
      <textarea v-model="notes" id="floatingTextarea" placeholder="Notes" class="form-control" rows="2" style="resize: none;"></textarea>
    </div>
      </div>
    </div>
  </div>
   
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
  padding: 2rem;
  height: 100%;
  width: 100%; 
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


  