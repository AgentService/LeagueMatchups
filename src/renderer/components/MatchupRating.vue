Waiit this is to complicated, lets ceck if there is another issue.

<template>
  <div class="card gradient-border">
    <div class="card-header d-flex justify-content-center align-items-center">
      <h5 class="mb-0">Rating</h5>
      <transition name="fade">
        <i v-if="autoSaved" key="autoSaved" class="fas fa-check-circle text-success"></i>
      </transition>
    </div>
    <div class="card-body">
      <textarea v-model="notes" placeholder="Rate your matchup" class="note-textarea " rows="4"></textarea>
    </div>
  </div>
</template>

<script>
import { computed, ref, watch } from "vue";
import { useStore } from "vuex";
import Debug from "debug";
const debug = Debug("app:component:MatchupNotes");

export default {
	setup() {
		const store = useStore();
		const currentMatchup = computed(() => store.getters.getCurrentMatchup);
		const autoSaved = ref(false);
		const notes = ref(currentMatchup.value ? currentMatchup.value.notes : "");
		const timeout = ref(null);

		function saveNotes(/*newNotes*/) {
			//store.dispatch('saveNotes', { matchupId: currentMatchup.value.id, notes: newNotes });
			autoSaved.value = false;
			// setTimeout(() => autoSaved.value = false, 3000);
		}

		watch(notes, (newNotes) => {
			clearTimeout(timeout.value);
			timeout.value = setTimeout(() => {
				saveNotes(newNotes);
			}, 1000);
		});

		watch(currentMatchup, (newMatchup, oldMatchup) => {
			if (newMatchup !== oldMatchup) {
				debug("Matchup changed, updating notes...");
				notes.value = newMatchup?.notes;
			}
		});

		return {
			notes,
			autoSaved,
			saveNotes,
		};
	},
};
</script>

<style scoped>
   

.note-textarea {
  border-radius: 10px;
  resize:none;
  height: 100%;
  width: 100%;
  border-color: var(--grey-4);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
  background:var(--background-1-gradient);
  color: var(--gold-2);
  font-family: 'Arial', sans-serif;
  line-height: 1.5;
  padding: 0.5rem;

}
.note-textarea:focus {
  outline: none;
  border-color: #FFFFFF;
  background-color: rgba(255, 255, 255, 1); /* Slightly more opaque on focus */
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.2); /* Adding a glow effect */
}
.note-textarea::placeholder {
  color: #A9A9A9; /* Lighter than the text color for subtlety */
  font-style: italic;
}
.note-textarea {
  transition: background-color 0.3s, box-shadow 0.3s, border-color 0.3s;
}
.note-textarea:hover {
  background-color: rgba(255, 255, 255, 1); /* Slightly more visible on hover */
}
.card-header {
  padding: 0.75rem 1.25rem;
}

/* Transition styles for fade effect */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.fade-enter-to, .fade-leave-from {
  opacity: 1;
}
</style>
