<template>
	<div class="notes-container bg-custom-dark-gradient shadow-lg p-4 space-y-4">
		<!-- Matchup Notes Header -->
		<div class="flex items-center justify-between mb-0 relative pb-1">
			<div class="flex items-center space-x-2 text-gold-2">
				<span class="font-semibold text-m">Matchup Notes</span>
				<img :src="getChampionImageSource('small', currentMatchup?.championAName)" alt="Champion A"
					class="w-8 h-8 rounded-full" />
				<span class="text-gray-500 text-sm">vs</span>
				<img :src="getChampionImageSource('small', currentMatchup?.championBName)" alt="Champion B"
					class="w-8 h-8 rounded-full" />
			</div>
		</div>

		<!-- Editor and Status Message -->
		<EditorMenuBar :editor="editor" />
		<div class="editor-wrapper">
			<editor-content :editor="editor" class="editor-content text-gold-1" :class="[borderColorClass]" />
		</div>

		<!-- Footer with Status and Save Button -->
		<div class="flex items-center justify-between mt-4 ms-2">
			<div class="flex items-center space-x-2">
				<!-- Status Indicator -->
				<span v-if="notesState === 'unsaved'" class="text-yellow-500">
					<i class="fas fa-exclamation-triangle"></i> Unsaved
				</span>
				<span v-else-if="notesState === 'saved'" class="text-green-500">
					<i class="fas fa-check-circle"></i> Saved
				</span>
				<span v-else-if="notesState === 'neutral'" class="text-gray-400">
					<i class="fas fa-check-circle"></i>
				</span>
			</div>
			<button @click="manualSave" :class="[
				'flex items-center px-4 py-2 font-semibold rounded-md transition duration-200',
				saveButtonBgClass
			]" :disabled="isDisabled">
				<i class="fas fa-save mr-2"></i> Save
			</button>
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

const saveButtonBgClass = computed(() => {
	switch (notesState.value) {
		case 'unsaved':
			return 'bg-yellow-500 hover:bg-yellow-400 !text-gray-900 !hover:text-gray-900'; // Yellow for unsaved
		case 'saved':
			return 'bg-green-600 hover:bg-green-500 text-white'; // Green for saved
		default:
			return 'bg-gray-900 text-gray-500 cursor-not-allowed'; // Gray for neutral/disabled
	}
});

const isDisabled = computed(() => notesState.value !== 'unsaved');


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
	}, 1000);
}

</script>



<style scoped></style>