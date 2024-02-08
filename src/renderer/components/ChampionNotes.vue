<template>
	<div class="card-header d-flex justify-content-between align-items-center">
		<span>Champion Notes</span>
		<div class="status-container"> <!-- Parent container with relative positioning -->
			<transition-group name="fade" tag="div">
				<div v-if="notesState === 'saved'" key="saved" class="status-message">
					<span class="text-success notes-saved">Saved</span>
				</div>
				<div v-if="notesState === 'editing'" key="editing" class="status-message">
					<i class="fas fa-edit text-warning"></i>
				</div>
			</transition-group>
		</div>
	</div>
	<div class="card-body ">
		<textarea spellcheck="false" v-model="editableNotes" placeholder="Type your notes here..."
			class="note-textarea zeee" rows="11"></textarea>
	</div>
</template>



<script setup>
import { computed, ref, watch, onMounted } from 'vue';
import { useStore } from 'vuex';

import Debug from 'debug';
const debug = Debug('app:component:ChampionNotes');
const store = useStore();

const championA = computed(() => store.getters['matchups/getChampionA']);
const championId = ref('');
const editableNotes = ref('');
const championSwitched = ref(false);
const userEditing = ref(false);
const autoSaved = ref(false);
const notesState = ref('neutral'); // 'neutral', 'editing', 'saved'

let saveTimeout = null;
let isInitialLoad = ref(true); // Flag for initial data load

function debouncedSave() {
	if (saveTimeout) clearTimeout(saveTimeout);
	saveTimeout = setTimeout(async () => {
		await saveChampionNotes();
		autoSaved.value = true;
		userEditing.value = false; // Reset userEditing flag on save

		// Set a timeout to hide the "saved" message after 2 seconds
		setTimeout(() => {
			autoSaved.value = false;
		}, 2000);
	}, 2000);
}


// Function to fetch and set the notes for the current champion
async function fetchAndSetNotes(currentChampionId) {
	await store.dispatch('notes/fetchChampionPersonalNotes', currentChampionId);
	editableNotes.value = store.getters['notes/getChampionPersonalNotes'](currentChampionId);

	// Delay the setting of isInitialLoad to false to avoid immediate auto-save
	setTimeout(() => {
		isInitialLoad.value = false;
	}, 2000);
}

// Watcher for championA to fetch and set notes
watch(championA, async (newChampionA) => {
	if (newChampionA && newChampionA.id !== championId.value) {
		championId.value = newChampionA.id;
		championSwitched.value = true
		await fetchAndSetNotes(championId.value);
	}
}, { immediate: true });

watch(editableNotes, (newValue, oldValue) => {
	if (!isInitialLoad.value && newValue !== oldValue) {
		if (championSwitched.value) {
			championSwitched.value = false;
			return;
		}
		notesState.value = 'editing';
		debouncedSave();
	}
});

onMounted(async () => {
	if (championA.value && championA.value.id) {
		championId.value = championA.value.id;
		await fetchAndSetNotes(championId.value);
	}
});

async function saveChampionNotes() {
	try {
		await store.dispatch('notes/updateChampionPersonalNotes', {
			championName: championId.value,
			content: editableNotes.value,
		});
        notesState.value = 'saved'; // Update state to 'saved' after successful save
		setTimeout(() => {
            notesState.value = 'neutral'; // Reset to 'neutral' after some time
		}, 2000);
	} catch (error) {
		console.error('Error saving notes:', error);
	}
}

</script>



<style scoped>
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

.status-container {
	position: relative;
	height: 25px;
}

.status-message {
	position: absolute;
	top: 0;
	right: 0;
}
</style>
