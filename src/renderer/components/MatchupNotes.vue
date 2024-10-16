<template>
	<div class="notes-container">
		<!-- Custom Header -->
		<!-- Custom Header -->
		<div class="widget-header justify-content-between">
			<div>
				<i class="fas fa-sticky-note note-icon"></i>
				<span class="widget-header-title ms-1">Matchup Notes</span>
			</div>
			<div class="champion-icons">
				<!-- Champion A -->
				<!-- <img :src="getChampionImageSource('small', currentMatchup.championAName)"
					:alt="currentMatchup.championAName" class="champion-matchup-icon" /> -->
				<!-- Champion Names and "vs" -->
				<span class="vs-text">
					 </span>
				<!-- Champion B -->
				<!-- <img :src="getChampionImageSource('small', currentMatchup.championBName)"
					:alt="currentMatchup.championBName" class="champion-matchup-icon" /> -->
			</div>

		</div>

		<!-- Editor and Status Message -->
		<EditorMenuBar :editor="editor" />
		<div class="editor-wrapper">
			<editor-content :editor="editor" class="editor-content" :class="[borderColorClass]" />
		</div>
		<div class="editor-footer-bar">
			<div class="left-status">
				<!-- Save Button -->
				<button @click="manualSave" :class="['btn', 'button', buttonTextColorClass]">
					<i class="fas fa-save"></i> Save
				</button>
			</div>
			<div class="right-status">
				<!-- Status Messages -->
				<span v-if="notesState === 'unsaved'" :class="[buttonTextColorClass]">
					<i class="fas fa-exclamation-triangle text-warning"></i> Unsaved
				</span>
				<span v-else-if="notesState === 'saved'" :class="[buttonTextColorClass]">
					<i class="fas fa-check-circle text-success"></i> Saved
				</span>
				<span v-else-if="notesState === 'neutral'">
					<i class="fas fa-check-circle text-muted"></i>
				</span>
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
import { getUrlHelper } from '../globalSetup';

// Initialize Vuex store
const store = useStore();

// Function to get champion image source using the URL helper
function getChampionImageSource(type, championId) {
	const urlHelper = getUrlHelper(); // Ensure the URL helper is used correctly
	return urlHelper.getChampionImageSource(type, championId);
}

// Computed properties for accessing the current matchup and state management
const currentMatchup = computed(() => store.getters['matchups/getCurrentMatchup']);
const notesState = ref('neutral');
const loadingNotes = ref(false); // Reactive property to indicate loading state
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
			spellcheck: 'false', // Disable spellcheck
			autocorrect: 'off', // Disable autocorrect
			autocapitalize: 'off', // Disable autocapitalize
			'data-gramm': 'false', // Disable Grammarly
		},
	},
	onUpdate: ({ editor }) => {
		notesState.value = 'unsaved'; // Set state to unsaved when content updates
		// debouncedSaveNotes(editor.getHTML());
	},
});

let saveTimeout = null;

// Computed property for button text color
const buttonTextColorClass = computed(() => {
	switch (notesState.value) {
		case 'unsaved':
			return 'text-warning';
		case 'saved':
			return 'text-success';
		default:
			return 'text-muted';
	}
});

// Computed property for border color class
const borderColorClass = computed(() => {
	switch (notesState.value) {
		case 'unsaved':
			return 'border-warning';
		case 'saved':
			return 'border-success';
		default:
			return 'border-muted';
	}
});

// Debounced save function to prevent excessive API calls
function debouncedSaveNotes(content) {
	if (saveTimeout) clearTimeout(saveTimeout);
	saveTimeout = setTimeout(async () => {
		await saveNotes(content);
		notesState.value = 'saved'; // Update state to 'saved' after successful save
		setTimeout(() => {
			notesState.value = 'neutral'; // Reset to 'neutral' after some time
		}, 2000);
	}, 2000); // Save 2 seconds after the last update
}

// Fetch notes on component mount
onMounted(() => {
	fetchNotes();
});

// Watch for changes in the current matchup and fetch notes
watch(
	currentMatchup,
	async (newVal, oldVal) => {
		if (newVal?.combinedId !== oldVal?.combinedId) {
			await fetchNotes();
		}
	},
	{ immediate: true }
);

// Fetch notes for the current matchup
async function fetchNotes() {
	if (currentMatchup.value?.combinedId) {
		loadingNotes.value = true; // Start loading
		await store.dispatch('notes/fetchMatchupNotes', currentMatchup.value.combinedId);
		const fetchedNotes = store.getters['notes/getPersonalNotesByMatchupId'](
			currentMatchup.value.combinedId
		);
		editor.value?.commands.setContent(fetchedNotes || '<p>Start typing...</p>');
		loadingNotes.value = false; // End loading
		notesState.value = 'neutral'; // Set state to neutral after loading
	}
}

// Save notes for the current matchup
async function saveNotes(content) {
	if (currentMatchup.value?.combinedId) {
		await store.dispatch('notes/saveOrUpdateMatchupNotes', {
			matchupId: currentMatchup.value.combinedId,
			content: content,
		});
	}
}

// Manual save function triggered by the save button
async function manualSave() {
	const content = editor.value?.getHTML();
	await saveNotes(content);
	notesState.value = 'saved';
	setTimeout(() => {
		notesState.value = 'neutral'; // Reset to 'neutral' after some time
	}, 2000);
}
</script>



<style scoped></style>