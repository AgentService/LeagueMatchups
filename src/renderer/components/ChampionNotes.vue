<template>
	<div class="card-header-custom d-flex justify-content-between align-items-center">
		<span>Champion Notes</span>
		<div class=" d-flex align-items-center justify-content-evenly">
			<div key="share-button" class="btn button share-button" @click="showNotesModal = true" aria-label="Shared">
				<i class="fa fa-sm fa-users" aria-hidden="true"></i>
			</div>
		</div>
		<SharedNotesModal ref="NotesSharedModalRef" :isVisible="showNotesModal" notesType="champion"
			title="Shared Champion Notes" :champion="championA" @update:isVisible="showNotesModal = $event" />
	</div>
	<div class="notes-body">
		<textarea spellcheck="false" v-model="editableNotes" placeholder="Type your notes here..." class="note-textarea"
			rows="12"></textarea>
	</div>
	<div class="status-container">
		<!-- <div v-if="notesState === 'neutral'" key="neutral" class="status-message">
			<i class="fa fa-save text-success"></i>
		</div> -->
		<div v-if="notesState === 'editing'" key="editing" class="status-message">
			<i class="fas fa-edit text-warning"></i>
		</div>
		<div v-if="notesState === 'saved'" key="saved" class="status-message">
			<i class="fas fa-check text-success"></i>
		</div>
	</div>
</template>



<script setup>
import { computed, ref, watch, onMounted } from 'vue';
import { useStore } from 'vuex';
import SharedNotesModal from './reuse/NotesShareModal.vue';

import Debug from 'debug';
const debug = Debug('app:component:ChampionNotes');
const store = useStore();

const championA = computed(() => store.getters['matchups/getChampionA']);
const championId = ref('');
const editableNotes = ref('');
const championSwitched = ref(false);
const autoSaved = ref(false);
const notesState = ref('neutral'); // 'neutral', 'editing', 'saved'

const showNotesModal = ref(false); // Controls the visibility of the modal
const NotesSharedModalRef = ref(null);

let saveTimeout = null;
let isInitialLoad = ref(true); // Flag for initial data load

async function fetchOtherUsersNotes() {
	await store.dispatch('notes/fetchOtherUsersChampionNotes', championId.value);
	// Ensure the child component is mounted and its method is available
	NotesSharedModalRef.value?.fetchData(championId.value);
}

// Call fetchOtherUsersNotes when the modal is opened
watch(showNotesModal, (newVal) => {
	if (newVal === true) {
		fetchOtherUsersNotes();
	}
});

function debouncedSave() {
	if (saveTimeout) clearTimeout(saveTimeout);
	saveTimeout = setTimeout(async () => {
		await saveChampionNotes();
		autoSaved.value = true;

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
.filter-container {
	border: 1px solid var(--grey-3);
	border-radius: 12px;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 0 1rem;
}

.filter-header {
	display: flex;
	align-items: center;
	justify-content: center;
	border-right: 1px solid var(--grey-3);
	margin-right: 1rem;
}

.share-button {
	text-transform: none;
	color: var(--gold-1);
}

.share-button:hover {
	color: var(--gold-2);
}

h3 {
	color: #333;
	margin-bottom: 20px;
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

.status-container {
	position: absolute;
	height: 25px;
	bottom: 1rem;
	right: 2rem;
}
</style>
