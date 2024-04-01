Waiit this is to complicated, lets ceck if there is another issue.

<template>
  <div class="card gradient-border">
    <div class="card-header-custom d-flex justify-content-center align-items-center">
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
