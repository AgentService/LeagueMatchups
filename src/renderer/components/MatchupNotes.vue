<template>
    <div class="card-header d-flex justify-content-between align-items-center">
		<span>Matchup Notes</span>
		<transition name="fade">
			<i v-if="autoSaved" key="autoSaved" class="fas fa-check-circle text-success"></i>
		</transition>
		<div class="buttons-container">
			<button @click="saveNotes" :class="{ 'btn btn-success': isSaved, 'btn': !isSaved, 'save-button': true }">
				<i class="far fa-save"></i>
			</button>
		</div>
	</div>
	<div class="card-body">
		<textarea spellcheck="false" v-model="localNotes" placeholder="Type your notes here..." class="note-textarea" rows="11"></textarea>

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
const localNotes = ref('');
const isSaved = ref(false)

watch(currentMatchup, (newMatchup) => {
	localNotes.value = newMatchup?.personalNotes || '';
}, { immediate: true });

watch(localNotes, () => {
	// Reset save status when notes are edited
	isSaved.value = false;
});

function saveNotes() {
	if (currentMatchup.value && currentMatchup.value.id) {
		store.dispatch('matchups/saveNotes', { matchupId: currentMatchup.value.id, notes: localNotes.value });
		debug('Saved notes for matchup', currentMatchup.value.id);
		isSaved.value = true; // Indicate that notes are saved

		// Set a timer to revert isSaved back to false after 2 seconds
		setTimeout(() => {
			isSaved.value = false;
		}, 1000);
	}
}

</script>


<style scoped>


</style>
