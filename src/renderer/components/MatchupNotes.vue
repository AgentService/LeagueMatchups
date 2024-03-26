<template>
	<div class="card-header-custom d-flex justify-content-between align-items-center">
		<span>Matchup Notes</span>
		<div class="btn button share-button" @click="showNotesModal = true" aria-label="Shared">
			<i class="fa fa-sm fa-users" aria-hidden="true"></i>
		</div>
		<SharedNotesModal ref="NotesSharedModalRef" :isVisible="showNotesModal" notesType="matchup"
			title="Shared Matchup Notes" :championA="championA" :championB="championB"
			@update:isVisible="showNotesModal = $event" />
	</div>

	<div class="notes-body">
		<!-- Loading indicator -->
		<div v-if="loadingNotes" class="loading-indicator">
			Loading notes...
		</div>
		<!-- Textarea for notes, shown only when not loading -->
		<textarea v-else spellcheck="false" v-model="localNotes" placeholder="Type your notes here..."
			class="note-textarea" rows="12"></textarea>
	</div>

	<div class="status-container">
		<div v-if="autoSaved" key="saved" class="status-message">
			<i class="fas fa-check text-success"></i>
		</div>
		<div v-if="userEditing" key="editing" class="status-message">
			<i class="fas fa-edit text-warning"></i>
		</div>
	</div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue';
import { useStore } from 'vuex';
import SharedNotesModal from './reuse/NotesShareModal.vue';
import Debug from 'debug';

const debug = Debug('app:component:MatchupNotes');
const store = useStore();

const currentMatchup = computed(() => store.getters['matchups/getCurrentMatchup']);
const championA = computed(() => store.getters['matchups/getChampionA']);
const championB = computed(() => store.getters['matchups/getChampionB']);
const showNotesModal = ref(false);
const NotesSharedModalRef = ref(null);
const autoSaved = ref(false);
const userEditing = ref(false);
const localNotesValue = ref('');
let saveTimeout = null;
const loadingNotes = ref(false); // New reactive property to indicate loading state

const isInitialLoad = ref(true);
const matchupSwitched = ref(false);

const localNotes = computed({
	get: () => localNotesValue.value,
	set: (newValue) => {
		if (!isInitialLoad.value && !matchupSwitched.value) {
			userEditing.value = true;
			localNotesValue.value = newValue;
			debouncedSaveNotes(newValue);
		} else {
			localNotesValue.value = newValue; // Directly update the value without triggering save
		}
	}
});

function debouncedSaveNotes(newValue) {
	if (saveTimeout) clearTimeout(saveTimeout);
	saveTimeout = setTimeout(async () => {
		await saveNotes(newValue);
		autoSaved.value = true;
		setTimeout(() => {
			autoSaved.value = false;
		}, 2000);
	}, 2000);
}

onMounted(() => {
	fetchNotes();
});

watch(currentMatchup, async (newVal, oldVal) => {
	if (newVal?.combinedId !== oldVal?.combinedId) {
		matchupSwitched.value = true; // Indicate a matchup switch has occurred
		await fetchNotes();
		// Reset the flags after fetching
		setTimeout(() => {
			isInitialLoad.value = false;
			matchupSwitched.value = false;
		}, 1000); // Give some time for the user to start editing
	}
}, { deep: true, immediate: true });

async function fetchNotes() {
	if (currentMatchup.value?.combinedId) {
		loadingNotes.value = true; // Start loading
		await store.dispatch('notes/fetchMatchupNotes', currentMatchup.value.combinedId);
		const fetchedNotes = store.getters['notes/getPersonalNotesByMatchupId'](currentMatchup.value.combinedId);
		localNotesValue.value = fetchedNotes || '';
		loadingNotes.value = false; // End loading
	}
}


async function saveNotes(newValue) {
	if (currentMatchup.value?.combinedId) {
		await store.dispatch('notes/saveOrUpdateMatchupNotes', {
			matchupId: currentMatchup.value.combinedId,
			content: newValue,
		});
		userEditing.value = false;
	}
}
</script>



<style scoped>
.share-button {
	text-transform: none;
	color: var(--gold-1);
}

.share-button:hover {
	color: var(--gold-2);
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
