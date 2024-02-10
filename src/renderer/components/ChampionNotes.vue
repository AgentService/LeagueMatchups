<template>
	<div class="card-header d-flex justify-content-between align-items-center">
		<div class="d-flex">
			<span>Champion Notes</span>
		</div>

		<div class="status-container d-flex align-items-center"> <!-- Parent container with relative positioning -->
			<transition-group name="fade" tag="div">
				<div v-if="notesState === 'saved'" key="saved" class="status-message">
					<span class="text-success notes-saved">Saved</span>
				</div>
				<div v-if="notesState === 'editing'" key="editing" class="status-message">
					<i class="fas fa-edit text-warning"></i>
				</div>
				<div class="btn button share-button" @click="showNotesModal = true" aria-label="Shared">
					<i class="fa fa-sm fa-users" aria-hidden="true"></i>
				</div>
			</transition-group>
		</div>
		<SharedNotesModal
		:isVisible="showNotesModal"
		:notes="otherUsersNotes"
		notesType="champion"
		title="Shared Champion Notes"
		@update:isVisible="showNotesModal = $event"
		/>
		
	</div>
	<div class="card-body ">
		<textarea spellcheck="false" v-model="editableNotes" placeholder="Type your notes here..."
			class="note-textarea" rows="11"></textarea>
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
const userEditing = ref(false);
const autoSaved = ref(false);
const notesState = ref('neutral'); // 'neutral', 'editing', 'saved'

const showNotesModal = ref(false); // Controls the visibility of the modal
const otherUsersNotes = ref([]); // Array to store other users' notes

let saveTimeout = null;
let isInitialLoad = ref(true); // Flag for initial data load

async function fetchOtherUsersNotes() {
	// This will fetch notes for the current champion from other users
	// You need to modify this according to your Vuex store and actions
	await store.dispatch('notes/fetchOtherUsersChampionNotes', championId.value);
	otherUsersNotes.value = store.getters['notes/getChampionNotesShared'](championId.value);
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
.share-button {
	text-transform: none;
	margin-right: 5rem;
	color: var(--gold-1);
}

.share-button:hover {
	color: var(--gold-2);
}

.overlay {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: rgba(0, 0, 0, 0.5);
	/* Slightly darker overlay for better focus on popup */
	display: flex;
	justify-content: center;
	align-items: center;
	z-index: 1000;
	/* Ensure overlay is above everything else */
}

.popup {
	width: 30%;
	min-width: 300px;
	/* Ensure popup is not too narrow on small screens */
	background-color: black;
	/* Light background for contrast */
	padding: 25px;
	border: 1px solid var(--grey-2);
	border-radius: 8px;
	/* More pronounced rounded corners */
	box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
	/* Softer shadow for depth */
	transition: transform 0.3s ease-out;
	/* Smooth enter effect */
	transform: scale(1.05);
	/* Slightly scale up for attention */
}

.note-details {
	background-color: var(--card-background);
	/* Light grey background for each note for better separation */
	padding: 15px;
	text-transform: none;
	border-radius: 4px;
	margin-bottom: 15px;
	margin-left: .75rem;
	font-size: .875rem;
	color: var(--grey-1);

	/* Increase spacing for better readability */
}

.note-updated {
	color: var(--grey-2);
	font-size: 0.875rem;
	/* Light grey for date */
}

.note-content {
	white-space: pre-wrap;
	background-color: rgb(23, 31, 56);
	padding: 1rem;
	border-radius: 12px;
	margin-top: .5rem;
	color: var(--gold-1);
	/* Dark grey text for softer contrast */
	font-size: 0.95rem;
	/* Slightly smaller font for content */
}

button {
	background-color: #4CAF50;
	color: white;
	border: none;
	border-radius: 5px;
	cursor: pointer;
	transition: background-color 0.2s;
}

button:hover {
	background-color: #45a049;
	/* Darker green on hover for feedback */
}

h3 {
	color: #333;
	/* Dark grey for titles */
	margin-bottom: 20px;
	/* More space below the title */
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
	position: relative;
	height: 25px;
}

.status-message {
	position: absolute;
	top: 0;
	right: 0;
}
</style>
