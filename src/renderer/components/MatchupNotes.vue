<template>
  <div class="card">
    <div class="card-header d-flex justify-content-center align-items-center">
      <h5 class="mb-0">Matchup Notes</h5>
      <transition name="fade">
        <i v-if="autoSaved" key="autoSaved" class="fas fa-check-circle text-success"></i>
      </transition>
    </div>
    <div class="card-body">
      <textarea v-model="localNotes" placeholder="Type your notes here..." class="note-textarea" rows="4"></textarea>
      <button @click="saveNotes" :class="{ 'btn-success': isSaved, 'save-button': true }" class="btn btn-primary">
        {{ isSaved ? 'Notes Saved' : 'Save Notes' }}
      </button>
    </div>
  </div>
</template>
<script setup>
import { computed, ref, watch } from 'vue';
import { useStore } from 'vuex';
import Debug from 'debug';
const debug = Debug('app:component:MatchupNotes');

const store = useStore();
const currentMatchup = computed(() => store.getters['matchups/getCurrentMatchup']);
const autoSaved = ref(false);
const localNotes = ref(''); // Initially empty
const isSaved = ref(false); // Reactive state for save status

watch(currentMatchup, (newMatchup) => {
  debug('New matchup:', newMatchup);
  localNotes.value = newMatchup?.notes || '';
}, { immediate: true });

watch(localNotes, () => {
  // Reset save status when notes are edited
  isSaved.value = false;
});

function saveNotes() {
  if (currentMatchup.value && currentMatchup.value.id) {
    store.dispatch('matchups/saveNotes', { matchupId: currentMatchup.value.id, notes: localNotes.value });
    isSaved.value = true; // Indicate that notes are saved
  }
}
</script>


<style scoped>

.btn-success {
  background-color: rgb(0, 90, 0);
  /* Other styles for success state */
}
.button-content {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.note-textarea {
  border-radius: 10px;
  resize: none;
  height: 100%;
  width: 100%;
  border-color: var(--grey-4);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
  background: var(--background-1-gradient);
  color: var(--gold-2);
  font-family: 'Arial', sans-serif;
  line-height: 1.5;
  padding: 0.5rem;

}

.note-textarea:focus {
  outline: none;
  border-color: #FFFFFF;
  background-color: rgba(255, 255, 255, 1);
  /* Slightly more opaque on focus */
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.2);
  /* Adding a glow effect */
}

.note-textarea::placeholder {
  color: #A9A9A9;
  /* Lighter than the text color for subtlety */
  font-style: italic;
}

.note-textarea {
  transition: background-color 0.3s, box-shadow 0.3s, border-color 0.3s;
}

.note-textarea:hover {
  background-color: rgba(255, 255, 255, 1);
  /* Slightly more visible on hover */
}

.card-header {
  padding: 0.75rem 1.25rem;
}

/* Transition styles for fade effect */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}
</style>
