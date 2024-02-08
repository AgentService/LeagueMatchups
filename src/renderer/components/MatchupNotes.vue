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
		<textarea spellcheck="false" v-model="localNotes"
			placeholder="Type your notes here..." class="note-textarea" rows="11"></textarea>
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
const localNotes = computed({
	get: () => store.getters['notes/getPersonalNotesByMatchupId'](currentMatchup.value?.id),
	set: (newValue) => {
		userEditing.value = true;
		debouncedSaveNotes(newValue);
	}
});


const userEditing = ref(false);
const championSwitched = ref(false);

let saveTimeout = null;

function debouncedSaveNotes(newValue) {
	if (saveTimeout) clearTimeout(saveTimeout);
	saveTimeout = setTimeout(() => {
		if (userEditing.value) { // Ensure we're saving because of user edits
			saveNotes(newValue);
			userEditing.value = false; // Reset the editing flag after saving
		}
	}, 2000); // Adjust the debounce time as needed
}

watch(currentMatchup, (newVal, oldVal) => {
	if (newVal?.id !== oldVal?.id) {
		championSwitched.value = true;
		store.dispatch('notes/fetchMatchupNotes', newVal.id);
		userEditing.value = false; // Reset user editing flag
	}
}, { deep: true, immediate: true });


async function saveNotes(newValue) {
	if (currentMatchup.value && currentMatchup.value.id) {
		await store.dispatch('notes/saveOrUpdateMatchupNotes', {
			matchupId: currentMatchup.value.id,
			content: newValue,
		});
		debug('Auto-saved notes for matchup', currentMatchup.value.id);
		autoSaved.value = true;
		// Set a timer to revert isSaved back to false after 2 seconds
		setTimeout(() => autoSaved.value = false, 2000);
	}
}

async function fetchNotes() {
	if (currentMatchup.value && currentMatchup.value.id) {
		await store.dispatch('notes/fetchMatchupNotes', currentMatchup.value.id);
	}
}

onMounted(() => {
	fetchNotes();
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
