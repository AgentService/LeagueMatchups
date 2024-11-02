<template>
	<div class="notes-container bg-custom-dark-gradient shadow-lg p-4 space-y-4">
		<!-- Champion Notes Header with Underline Effect -->
		<div class="flex items-center justify-between mb-0 relative pb-1">
			<div class="flex items-center space-x-2 text-gold-2 ">
				<span class="font-semibold text-m">Champion Notes</span>
				<img :src="getChampionImageSource('small', championA?.name)" alt="Champion A"
					class="w-8 h-8 rounded-full" />
			</div>
		</div>

		<!-- Editor and Status Message -->
		<EditorMenuBar :editor="editor" />
		<div class="editor-wrapper">
			<editor-content :editor="editor" class="editor-content text-gold-1  " :class="[borderColorClass]" />
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
import { ref, onBeforeUnmount, onMounted, watch, computed } from 'vue';
import { useEditor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import EditorMenuBar from './EditorMenuBar.vue';
import { useStore } from 'vuex';
import { getUrlHelper } from '../globalSetup';

function getChampionImageSource(type, championId) {
	const urlHelper = getUrlHelper(); // Ensure the URL helper is used correctly
	return urlHelper.getChampionImageSource(type, championId);
}

// Initialize Vuex store
const store = useStore();
const championA = computed(() => store.getters['matchups/getChampionA']);
const championId = ref('');
const notesState = ref('neutral');
const showNotesModal = ref(false);
const NotesSharedModalRef = ref(null);

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
		notesState.value = 'unsaved';
		// debouncedSave(editor.getHTML());
	},
});

// Ensure editor cleanup
onBeforeUnmount(() => {
	if (editor.value) {
		editor.value.destroy();
	}
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


// Fetch notes for the current champion
async function fetchAndSetNotes(currentChampionId) {
	await store.dispatch('notes/fetchChampionPersonalNotes', currentChampionId);
	const fetchedNotes = store.getters['notes/getChampionPersonalNotes'](
		currentChampionId
	);
	editor.value?.commands.setContent(fetchedNotes || '<p>Start typing...</p>');
}

// Debounced save function to prevent excessive API calls
function debouncedSave(content) {
	if (saveTimeout) clearTimeout(saveTimeout);
	saveTimeout = setTimeout(async () => {
		await saveChampionNotes(content);
		notesState.value = 'saved'; // Update state to 'saved' after successful save
		setTimeout(() => {
			notesState.value = 'neutral'; // Reset to 'neutral' after some time
		}, 1000);
	}, 1000); // Save 1 second after the last keystroke
}

// Save champion notes
async function saveChampionNotes(content) {
	try {
		await store.dispatch('notes/updateChampionPersonalNotes', {
			championName: championId.value,
			content,
		});
	} catch (error) {
		console.error('Error saving notes:', error);
	}
}

// Computed property for the button background color based on save state
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

const isDisabled = computed(() => notesState.value !== 'unsaved'); // Disable if not unsaved


// Manual save function triggered by the save button
async function manualSave() {
	const content = editor.value?.getHTML();
	await saveChampionNotes(content);
	notesState.value = 'saved';
	setTimeout(() => {
		notesState.value = 'neutral'; // Reset to 'neutral' after some time
	}, 1000);
}

watch(championA, async (newChampionA) => {
	if (newChampionA && newChampionA.id !== championId.value) {
		championId.value = newChampionA.id;
		await fetchAndSetNotes(championId.value); // Fetch and set notes for the new champion
	}
}, { immediate: true });

// Fetch other users' notes when the modal is opened
watch(showNotesModal, (newVal) => {
	if (newVal === true) {
		fetchOtherUsersNotes();
	}
});

async function fetchOtherUsersNotes() {
	await store.dispatch('notes/fetchOtherUsersChampionNotes', championId.value);
	NotesSharedModalRef.value?.fetchData(championId.value);
}

// Fetch notes on component mount
onMounted(async () => {
	if (championA.value && championA.value.id) {
		championId.value = championA.value.id;
		await fetchAndSetNotes(championId.value);
	}
});
</script>

<style>
.editor-wrapper {
	flex: 1;
	display: flex;
	overflow: hidden;
	border-radius: 8px;
	width: 100%;
}

.editor-content {
	flex: 1;
	width: 100%;
	min-height: 335px;
	max-height: 335px;
	border: 1px solid #4a556880;
	margin: 2px;
	border-radius: 8px;
	transition: border-color 0.3s ease;
	padding: .5rem;
	font-weight: 400;
}

.editor-content:focus {
	border-color: #ffffff !important;
}

.notes-container ul {
	list-style-type: disc;
	padding-left: 2rem;

}

.notes-container li {
	margin-bottom: -.5rem;
	line-height: 1.25;
}

.ProseMirror {
	flex: 1;
	width: 100%;
	min-height: 322px;
	max-height: 322px;
	overflow-y: auto;
	outline: none;
	padding: .5rem;
	font-size: 0.9rem;
}

.notes-container .ProseMirror {
	line-height: 1.2;
	/* Adjust line height within editor */
}

.ProseMirror:focus-within {
	border-color: #ffffff !important;
}

.editor-content {
	flex: 1;
	width: 100%;
}
</style>