<template>
	<div class="card-header d-flex justify-content-between align-items-center">
		<span>Matchup Notes</span>
		<div class="status-container"> <!-- Parent container with relative positioning -->
			<transition-group name="fade" tag="div">
				<div v-if="autoSaved" key="saved" class="status-message">
					<span class="text-success notes-saved">Saved</span>
					<!-- <i class="fas fa-save text-success"></i> -->

				</div>
				<div v-if="userEditing" key="editing" class="status-message">
					<i class="fas fa-edit text-warning"></i>
					<!-- <span class="text-warning notes-saved">Editing</span> -->

				</div>
			</transition-group>
		</div>
	</div>
	<div class="card-body">
		<textarea spellcheck="false" v-model="localNotes" placeholder="Type your notes here..." class="note-textarea"
			rows="11"></textarea>
	</div>
</template>
<script setup>
import { computed, ref, watch, onMounted } from 'vue';
import { useStore } from 'vuex';
import Debug from 'debug';
const debug = Debug('app:component:MatchupNotes');

const store = useStore();
const currentMatchup = computed(() => store.getters['matchups/getCurrentMatchup']);
const autoSaved = ref(false);
const localNotes = ref('');
const isSaved = ref(false)
const userEditing = ref(false);

let saveTimeout = null;

// Debounce function to limit how often we save the notes
function debouncedSaveNotes() {
	if (saveTimeout) clearTimeout(saveTimeout);
	saveTimeout = setTimeout(async () => {
		await saveNotes();
		autoSaved.value = true;
		userEditing.value = false;

		// Optionally, reset autoSaved flag after a certain time
		setTimeout(() => autoSaved.value = false, 2000);
	}, 2000); // Adjust the delay as needed
}

watch(currentMatchup, (newMatchup) => {
	localNotes.value = newMatchup?.personalNotes || '';
}, { immediate: true });

watch(localNotes, () => {
	// Reset save status when notes are edited
	isSaved.value = false;
});

watch(localNotes, (newValue, oldValue) => {
	if (newValue !== oldValue) {
		userEditing.value = true;
		autoSaved.value = false;
		debouncedSaveNotes();
	}
});

async function saveNotes() {
	if (currentMatchup.value && currentMatchup.value.id) {
		await store.dispatch('matchups/saveNotes', { matchupId: currentMatchup.value.id, notes: localNotes.value });
		debug('Auto-saved notes for matchup', currentMatchup.value.id);
		isSaved.value = true;

		// Set a timer to revert isSaved back to false after 2 seconds
		setTimeout(() => isSaved.value = false, 2000);
	}
}
onMounted(() => {
	if (currentMatchup.value) {
		localNotes.value = currentMatchup.value.personalNotes || '';
	}
});
</script>


<style scoped>
.status-container {
	position: relative;
	height: 25px;
}

.notes-saved {
	font-size: 1rem;
	text-transform: none;
}

/* Transition styles for fade */
.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.5s;
}

.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}

.status-message {
	position: absolute;
	top: 0;
	right: 0;
}
</style>
