<template>
	<!-- Button and Modal for Shared Notes (commented out for now) -->
	<!-- <div class="d-flex justify-content-end align-items-center">
		<button class="btn" @click="showNotesModal = true" aria-label="Shared">
			<i class="fa fa-sm fa-users" aria-hidden="true"></i>
		</button>
		<SharedNotesModal ref="NotesSharedModalRef" :isVisible="showNotesModal" notesType="matchup"
		title="Shared Matchup Notes" :championA="championA" :championB="championB"
		@update:isVisible="showNotesModal = $event" />
	</div> -->

	<!-- Editor Menu Bar and Content -->
	<div class="notes-container">

		<EditorMenuBar :editor="editor" />
		<div class="editor-wrapper">
			<editor-content :editor="editor" class="editor-content" />
		</div>

		<!-- Status Message -->

		<div class="status-container">
			<div v-if="autoSaved" key="saved" class="status-message">
				<i class="fas fa-check text-success"></i> Saved!
			</div>
			<div v-if="userEditing" key="editing" class="status-message">
				<i class="fas fa-edit text-warning"></i> Editing...
			</div>
		</div>
	</div>

</template>

<script setup>
import { useEditor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import EditorMenuBar from './EditorMenuBar.vue';
import { computed, ref, watch, onMounted } from 'vue';
import { useStore } from 'vuex';

// Initialize Vuex store
const store = useStore();

// Computed properties for accessing the current matchup and state management
const currentMatchup = computed(() => store.getters['matchups/getCurrentMatchup']);
const autoSaved = ref(false);
const userEditing = ref(false);
const localNotesValue = ref('');
let saveTimeout = null;
const loadingNotes = ref(false); // New reactive property to indicate loading state
const isInitialLoad = ref(true);
const matchupSwitched = ref(false);

// Editor setup
const editor = useEditor({
	extensions: [
		StarterKit,
		Underline,
		Link.configure({
			openOnClick: false,
		}),
	],
	content: '', // Initial empty content, will be set after fetching
	editorProps: {
		attributes: {
			class: 'ProseMirror',
			spellcheck: 'false',       // Disable spellcheck
			autocorrect: 'off',        // Disable autocorrect
			autocapitalize: 'off',     // Disable autocapitalize
			'data-gramm': 'false',     // Disable Grammarly
		},
	},
	onUpdate: ({ editor }) => {
		userEditing.value = true; // Mark as editing when content updates
		debouncedSaveNotes(editor.getHTML()); // Save notes on update with debounce
	},
});

// Computed property for local notes to handle changes
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

// Debounced save function to prevent excessive API calls
function debouncedSaveNotes(newValue) {
	if (saveTimeout) clearTimeout(saveTimeout);
	saveTimeout = setTimeout(async () => {
		await saveNotes(newValue);
		autoSaved.value = true;
		setTimeout(() => {
			autoSaved.value = false;
		}, 2000);
	}, 2000); // Save 2 seconds after the last update
}

// Fetch notes on component mount
onMounted(() => {
	fetchNotes();
});

// Watch for changes in the current matchup and fetch notes
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

// Fetch notes for the current matchup
async function fetchNotes() {
	if (currentMatchup.value?.combinedId) {
		loadingNotes.value = true; // Start loading
		await store.dispatch('notes/fetchMatchupNotes', currentMatchup.value.combinedId);
		const fetchedNotes = store.getters['notes/getPersonalNotesByMatchupId'](currentMatchup.value.combinedId);
		localNotesValue.value = fetchedNotes || '<p>Start typing...</p>';
		editor.value?.commands.setContent(localNotesValue.value); // Set editor content
		loadingNotes.value = false; // End loading
	}
}

// Save notes for the current matchup
async function saveNotes(newValue) {
	if (currentMatchup.value?.combinedId) {
		await store.dispatch('notes/saveOrUpdateMatchupNotes', {
			matchupId: currentMatchup.value.combinedId,
			content: newValue,
		});
		userEditing.value = false; // Reset editing state after save
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
.share-button {
	text-align: right;
}
</style>
